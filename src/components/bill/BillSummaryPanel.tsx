'use client';

import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { motion } from 'framer-motion';
import { useBillSummary } from '@/hooks/useBillSummary';
import { centsToDisplayValue } from '@/utils/currency';
import { RECEIPT_TOP_EDGE_CLASS_NAME } from '@/utils/receiptEdgeClassName';

const EXPORT_IMAGE_FILE_NAME = 'resumo-divide-a-conta.png';

export function BillSummaryPanel({ billId }: { billId: string }) {
  const { summary, isLoading } = useBillSummary({ billId, isEnabled: true });
  const summaryRef = useRef<HTMLDivElement>(null);

  async function exportSummaryAsImage() {
    const summaryElement = summaryRef.current;

    if (!summaryElement) return;

    const imageDataUrl = await toPng(summaryElement, { backgroundColor: '#F2F1E7' });

    const downloadLink = document.createElement('a');
    downloadLink.href = imageDataUrl;
    downloadLink.download = EXPORT_IMAGE_FILE_NAME;
    downloadLink.click();
  }

  if (isLoading || !summary) {
    return <p className="font-money text-sm text-ink-muted">Carregando resumo...</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8 max-w-md"
    >
      <div
        ref={summaryRef}
        className={`${RECEIPT_TOP_EDGE_CLASS_NAME} bg-paper border border-paper-line p-6 shadow-sm`}
      >
        <header className="border-b border-dashed border-paper-line pb-4 mb-4 text-center">
          <h2 className="font-display text-xl tracking-wide">
            {summary.bill.restaurantName ?? 'Conta sem nome'}
          </h2>
          <p className="font-money text-sm text-ink-muted mt-1">divide a conta</p>
          <p className="font-money text-lg mt-3 tabular-nums">
            Total R$ {centsToDisplayValue({ amountInCents: summary.bill.totalAmountInCents })}
          </p>
        </header>

        <div className="space-y-5">
          {summary.participants.map((participant) => (
            <div key={participant.participantId}>
              <div className="flex items-baseline justify-between">
                <strong className="font-body font-semibold">{participant.displayName}</strong>
                <span className="font-money tabular-nums">
                  R$ {centsToDisplayValue({ amountInCents: participant.amountInCents })}
                </span>
              </div>

              <ul className="mt-1 space-y-0.5">
                {participant.items.map((item) => (
                  <li
                    key={item.billItemId}
                    className="flex items-baseline justify-between text-sm text-ink-muted font-money"
                  >
                    <span className="truncate pr-2">{item.description}</span>
                    <span className="tabular-nums shrink-0">
                      R$ {centsToDisplayValue({ amountInCents: item.amountInCents })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {summary.hasUnclaimedItems && (
        <p className="mt-3 text-sm text-pending font-body">Existem itens sem dono ainda.</p>
      )}

      <button
        onClick={exportSummaryAsImage}
        className="mt-4 w-full bg-stamp hover:bg-stamp-dark text-paper font-body font-medium py-2.5 transition-colors"
      >
        Exportar como imagem
      </button>
    </motion.div>
  );
}