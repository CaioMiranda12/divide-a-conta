import Link from 'next/link';
import type { ApiBillListItem } from '@/types/api';

const STATUS_COLOR_CLASS_NAME: Record<ApiBillListItem['status'], string> = {
  processing: 'text-pending',
  draft: 'text-pending',
  open: 'text-confirmed',
  closed: 'text-ink-muted',
  failed: 'text-stamp',
};

const STATUS_LABELS: Record<ApiBillListItem['status'], string> = {
  processing: 'Processando',
  draft: 'Rascunho',
  open: 'Aberta',
  closed: 'Encerrada',
  failed: 'Falhou',
};

export function BillListItemCard({ bill }: { bill: ApiBillListItem }) {
  return (
    <Link
      href={`/bill/${bill.id}`}
      className="flex items-center justify-between border-b border-dashed border-paper-line py-3 hover:bg-ink/5 px-1 -mx-1 transition-colors"
    >
      <span className="font-body text-sm truncate pr-2">{bill.restaurantName ?? 'Conta sem nome'}</span>
      <span className={`font-money text-xs shrink-0 ${STATUS_COLOR_CLASS_NAME[bill.status]}`}>
        {STATUS_LABELS[bill.status]}
      </span>
    </Link>
  );
}