import Link from 'next/link';
import type { ApiBillListItem } from '@/types/api';

const STATUS_LABELS: Record<ApiBillListItem['status'], string> = {
  processing: 'Processando',
  draft: 'Rascunho',
  open: 'Aberta',
  closed: 'Encerrada',
  failed: 'Falhou',
};

export function BillListItemCard({ bill }: { bill: ApiBillListItem }) {
  return (
    <Link href={`/bill/${bill.id}`}>
      <span>{bill.restaurantName ?? 'Conta sem nome'}</span>
      <span> {STATUS_LABELS[bill.status]}</span>
    </Link>
  );
}