-- Distributed request rate limiting for multi-instance deployments.
create table if not exists public.rate_limits (
  key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
revoke all on table public.rate_limits from anon, authenticated;

create or replace function public.consume_rate_limit(
  p_key text,
  p_max_requests integer,
  p_window_ms bigint
)
returns table(allowed boolean, retry_after_ms bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.rate_limits%rowtype;
  now_value timestamptz := clock_timestamp();
  elapsed_ms bigint;
  remaining_ms bigint;
begin
  if p_max_requests < 1 or p_window_ms < 1 then
    return query select false, p_window_ms;
    return;
  end if;

  insert into public.rate_limits (key, window_started_at, request_count, updated_at)
  values (p_key, now_value, 1, now_value)
  on conflict (key) do update
    set window_started_at = case
          when extract(epoch from (now_value - rate_limits.window_started_at)) * 1000 >= p_window_ms
            then now_value
          else rate_limits.window_started_at
        end,
        request_count = case
          when extract(epoch from (now_value - rate_limits.window_started_at)) * 1000 >= p_window_ms
            then 1
          else rate_limits.request_count + 1
        end,
        updated_at = now_value
  returning * into current_row;

  elapsed_ms := floor(extract(epoch from (now_value - current_row.window_started_at)) * 1000);
  remaining_ms := greatest(p_window_ms - elapsed_ms, 0);

  if current_row.request_count > p_max_requests then
    return query select false, remaining_ms;
  end if;
  return query select true, 0::bigint;
end;
$$;

create or replace function public.clear_rate_limit(p_key text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.rate_limits where key = p_key;
$$;

revoke all on function public.consume_rate_limit(text, integer, bigint) from public;
revoke all on function public.clear_rate_limit(text) from public;
grant execute on function public.consume_rate_limit(text, integer, bigint) to service_role;
grant execute on function public.clear_rate_limit(text) to service_role;
