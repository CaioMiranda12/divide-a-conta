'use client';

import { useRouter } from 'next/navigation';
import { useBillList } from '@/hooks/useBillList';
import { BillUploadForm } from '@/components/home/BillUploadForm';
import { BillListItemCard } from '@/components/home/BillListItemCard';

export function HomePageContent({ userName }: { userName: string }) {
  const router = useRouter();
  const { bills, isLoading, reloadBills } = useBillList();

  function handleBillCreated({ billId }: { billId: string }) {
    router.push(`/bill/${billId}`);
  }

  return (
    <div>
      <h1>Olá, {userName}</h1>

      <BillUploadForm onBillCreated={handleBillCreated} />

      <h2>Suas contas</h2>

      {isLoading && <p>Carregando...</p>}

      {!isLoading && bills.length === 0 && <p>Nenhuma conta ainda.</p>}

      {bills.map((bill) => (
        <BillListItemCard key={bill.id} bill={bill} />
      ))}
    </div>
  );
}