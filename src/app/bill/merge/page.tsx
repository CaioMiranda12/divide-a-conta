import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/services/auth/getCurrentUser';
import { MergeBillSelector } from '@/components/bill/MergeBillSelector';

export default async function MergeBillsPage() {
  const currentUser = await getCurrentUser();

  const isLoggedOut = !currentUser;

  if (isLoggedOut) redirect('/login?redirect=/bills/merge');

  return <MergeBillSelector />;
}