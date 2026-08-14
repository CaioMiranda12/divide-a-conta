'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBillList } from '@/hooks/useBillList';
import { useLogout } from '@/hooks/useLogout';
import { useCreateManualBill } from '@/hooks/useCreateManualBill';
import { BillUploadForm } from '@/components/home/BillUploadForm';
import { BillListItemCard } from '@/components/home/BillListItemCard';

export function HomePageContent({ userName }: { userName: string }) {
  const router = useRouter();
  const { bills, isLoading, reloadBills } = useBillList();
  const { logout, isLoggingOut } = useLogout();
  const { createManualBill, isSubmitting: isCreatingManualBill } = useCreateManualBill();

  function handleBillCreated({ billId }: { billId: string }) {
    router.push(`/bill/${billId}`);
  }

  async function handleLogout() {
    const hasSucceeded = await logout();

    if (hasSucceeded) router.push('/login');
  }

  async function handleCreateManualBill() {
    const billId = await createManualBill();

    if (billId) router.push(`/bill/${billId}`);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-body text-2xl font-semibold tracking-tight text-primary">Olá, {userName}</h1>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-sm font-body text-secondary hover:text-negative disabled:opacity-60"
        >
          Sair
        </button>
      </div>

      <div className="mt-6">
        <BillUploadForm onBillCreated={handleBillCreated} />
      </div>

      <button
        onClick={handleCreateManualBill}
        disabled={isCreatingManualBill}
        className="mt-3 w-full text-center text-sm font-body text-secondary hover:text-primary border border-subtle rounded-xl py-2.5 disabled:opacity-60"
      >
        {isCreatingManualBill ? 'Criando...' : 'Criar conta sem foto'}
      </button>

      <Link
        href="/bills/merge"
        className="mt-3 block text-center text-sm font-body text-secondary hover:text-primary border border-subtle rounded-xl py-2.5"
      >
        Juntar contas
      </Link>

      <h2 className="font-body text-xs uppercase tracking-widest text-secondary mt-10 mb-3">Suas contas</h2>

      {isLoading && <p className="font-body text-sm text-secondary">Carregando...</p>}

      {!isLoading && bills.length === 0 && (
        <p className="font-body text-sm text-secondary">Nenhuma conta ainda.</p>
      )}

      <div className="space-y-2">
        {bills.map((bill) => (
          <BillListItemCard key={bill.id} bill={bill} onDeleted={reloadBills} />
        ))}
      </div>
    </div>
  );
}