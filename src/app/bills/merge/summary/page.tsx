import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentUser } from '@/services/auth/getCurrentUser';
import { MergedBillSummaryView } from '@/components/bill/MergedBillSummaryView';

export default async function MergedBillSummaryPage() {
  const currentUser = await getCurrentUser();

  const isLoggedOut = !currentUser;

  if (isLoggedOut) redirect('/login?redirect=/bills/merge');

  return (
    <Suspense>
      <MergedBillSummaryView />
    </Suspense>
  );
}   