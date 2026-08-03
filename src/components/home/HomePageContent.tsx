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
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="font-display text-2xl tracking-wide">Olá, {userName}</h1>

      <div className="mt-6">
        <BillUploadForm onBillCreated={handleBillCreated} />
      </div>

      <h2 className="font-display text-lg tracking-wide mt-10 mb-3">Suas contas</h2>

      {isLoading && <p className="font-body text-sm text-ink-muted">Carregando...</p>}

      {!isLoading && bills.length === 0 && (
        <p className="font-body text-sm text-ink-muted">Nenhuma conta ainda.</p>
      )}

      <div className="space-y-2">
        {bills.map((bill) => (
          <BillListItemCard key={bill.id} bill={bill} />
        ))}
      </div>
    </div>
  );
}