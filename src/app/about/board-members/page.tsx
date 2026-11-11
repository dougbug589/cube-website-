import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function BoardMembersPage() {
  redirect('/about#governing-board');
}
