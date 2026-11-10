'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';

interface ComboSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  /** Allow values that are not in the list (typed by the admin). Default true. */
  allowCustom?: boolean;
  className?: string;
}

/**
 * Dropdown that always lists every option (scrollable), with type-to-filter
 * and an optional "use custom value" entry. Replaces <datalist>, which only
 * shows options matching the current text.
 */
export default function ComboSelect({
  value,
  onChange,
  options,
  placeholder = 'Select or type...',
  allowCustom = true,
  className = '',
}: ComboSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');       // text typed since opening
  const [typing, setTyping] = useState(false);  // filter only once the user types
  const [active, setActive] = useState(0);

  const uniqueOptions = useMemo(
    () => Array.from(new Set(options.map((o) => o.trim()).filter(Boolean))),
    [options]
  );

  const filtered = useMemo(() => {
    if (!typing || !query.trim()) return uniqueOptions;
    const q = query.trim().toLowerCase();
    return uniqueOptions.filter((o) => o.toLowerCase().includes(q));
  }, [uniqueOptions, query, typing]);

  const trimmedQuery = query.trim();
  const showCustom =
    allowCustom &&
    typing &&
    trimmedQuery !== '' &&
    !uniqueOptions.some((o) => o.toLowerCase() === trimmedQuery.toLowerCase());

  const itemCount = filtered.length + (showCustom ? 1 : 0);

  const openList = () => {
    setOpen(true);
    setTyping(false);
    setQuery(value);
    const idx = uniqueOptions.indexOf(value);
    setActive(idx >= 0 ? idx : 0);
  };

  const closeList = () => {
    setOpen(false);
    setTyping(false);
  };

  const commit = (v: string) => {
    onChange(v);
    setQuery(v);
    closeList();
  };

  // Close on outside click; keep a typed custom value.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        if (allowCustom && typing && trimmedQuery) onChange(trimmedQuery);
        closeList();
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, typing, trimmedQuery, allowCustom, onChange]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
      e.preventDefault();
      openList();
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (itemCount ? (a + 1) % itemCount : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (itemCount ? (a - 1 + itemCount) % itemCount : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active < filtered.length) commit(filtered[active]);
      else if (showCustom) commit(trimmedQuery);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setQuery(value);
      closeList();
    } else if (e.key === 'Tab') {
      if (allowCustom && typing && trimmedQuery) onChange(trimmedQuery);
      closeList();
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        value={open ? query : value}
        placeholder={placeholder}
        readOnly={!allowCustom}
        onFocus={() => !open && openList()}
        onClick={() => !open && openList()}
        onChange={(e) => {
          if (!open) setOpen(true);
          setTyping(true);
          setQuery(e.target.value);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        className="w-full p-2.5 pr-9 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#070E5C] cursor-pointer"
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={open ? 'Close options' : 'Show all options'}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (open) closeList();
          else {
            openList();
            inputRef.current?.focus();
          }
        }}
        className="absolute inset-y-0 right-0 px-2.5 flex items-center text-slate-500 hover:text-[#070E5C]"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1.5 w-full max-h-60 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
        >
          {filtered.map((opt, i) => {
            const selected = opt === value;
            return (
              <li
                key={opt}
                data-index={i}
                role="option"
                aria-selected={selected}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(opt)}
                onMouseEnter={() => setActive(i)}
                className={`px-3 py-2 text-xs flex items-center justify-between gap-2 cursor-pointer ${
                  i === active ? 'bg-[#EAF2F8] text-[#070E5C]' : 'text-slate-700'
                } ${selected ? 'font-bold' : ''}`}
              >
                <span>{opt}</span>
                {selected && <Check className="w-3.5 h-3.5 shrink-0 text-[#070E5C]" />}
              </li>
            );
          })}

          {showCustom && (
            <li
              data-index={filtered.length}
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(trimmedQuery)}
              onMouseEnter={() => setActive(filtered.length)}
              className={`px-3 py-2 text-xs flex items-center gap-2 cursor-pointer border-t border-slate-100 ${
                active === filtered.length ? 'bg-[#EAF2F8] text-[#070E5C]' : 'text-slate-600'
              }`}
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Use &ldquo;{trimmedQuery}&rdquo;</span>
            </li>
          )}

          {itemCount === 0 && (
            <li className="px-3 py-2 text-xs text-slate-400">No matching options</li>
          )}
        </ul>
      )}
    </div>
  );
}
