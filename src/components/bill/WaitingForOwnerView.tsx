import type { BillStatus } from '@/generated/prisma/client';

const STATUS_MESSAGES: Record<BillStatus, string> = {
  processing: 'A conta ainda está sendo processada.',
  draft: 'O dono da conta ainda está revisando os itens.',
  open: 'A conta está aberta.',
  closed: 'Essa conta já foi encerrada.',
  failed: 'Não foi possível processar essa conta.',
};

const STATUS_COLOR_CLASS_NAME: Record<BillStatus, string> = {
  processing: 'text-pending',
  draft: 'text-pending',
  open: 'text-confirmed',
  closed: 'text-ink-muted',
  failed: 'text-stamp',
};

export function WaitingForOwnerView({ status }: { status: BillStatus }) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <p className={`font-display text-lg ${STATUS_COLOR_CLASS_NAME[status]}`}>
        {STATUS_MESSAGES[status]}
      </p>
    </div>
  );
}