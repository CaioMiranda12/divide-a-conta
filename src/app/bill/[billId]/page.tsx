import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/services/auth/getCurrentUser';
import { BillPageContent } from '@/components/bill/BillPageContent';

export default async function BillPage({
  params,
}: {
  params: Promise<{ billId: string }>;
}) {
  const { billId } = await params;
  const currentUser = await getCurrentUser();

  const isLoggedOut = !currentUser;

  if (isLoggedOut) redirect(`/login?redirect=/bill/${billId}`);

  return <BillPageContent billId={billId} />;
}