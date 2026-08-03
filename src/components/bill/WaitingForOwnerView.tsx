import type { BillStatus } from '@/generated/prisma/client';

const STATUS_MESSAGES: Record<BillStatus, string> = {
  processing: 'A conta ainda está sendo processada.',
  draft: 'O dono da conta ainda está revisando os itens.',
  open: 'A conta está aberta.',
  closed: 'Essa conta já foi encerrada.',
  failed: 'Não foi possível processar essa conta.',
};

export function WaitingForOwnerView({ status }: { status: BillStatus }) {
  return <p>{STATUS_MESSAGES[status]}</p>;
}