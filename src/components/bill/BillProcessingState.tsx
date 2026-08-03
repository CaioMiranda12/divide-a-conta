import type { BillStatus } from '@/generated/prisma/client';

const STATUS_MESSAGES: Partial<Record<BillStatus, string>> = {
  processing: 'Estamos lendo os itens da nota fiscal...',
  failed: 'Não foi possível processar essa imagem.',
};

const STATUS_COLOR_CLASS_NAME: Partial<Record<BillStatus, string>> = {
  processing: 'text-pending',
  failed: 'text-stamp',
};

export function BillProcessingState({ status }: { status: BillStatus }) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <p className={`font-display text-lg ${STATUS_COLOR_CLASS_NAME[status]}`}>{STATUS_MESSAGES[status]}</p>
    </div>
  );
}