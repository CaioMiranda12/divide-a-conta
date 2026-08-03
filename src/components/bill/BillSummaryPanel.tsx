'use client';

import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { motion } from 'framer-motion';
import { useBillSummary } from '@/hooks/useBillSummary';
import { centsToDisplayValue } from '@/utils/currency';

const EXPORT_IMAGE_FILE_NAME = 'resumo-divide-a-conta.png';

export function BillSummaryPanel({ billId }: { billId: string }) {
  const { summary, isLoading } = useBillSummary({ billId, isEnabled: true });
  const summaryRef = useRef<HTMLDivElement>(null);

  async function exportSummaryAsImage() {
    const summaryElement = summaryRef.current;

    if (!summaryElement) return;

    const imageDataUrl = await toPng(summaryElement);

    const downloadLink = document.createElement('a');
    downloadLink.href = imageDataUrl;
    downloadLink.download = EXPORT_IMAGE_FILE_NAME;
    downloadLink.click();
  }

  if (isLoading || !summary) return <p>Carregando resumo...</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div ref={summaryRef}>
        <header>
          <h2>{summary.bill.restaurantName ?? 'Conta sem nome'}</h2>
          <p>Total: R$ {centsToDisplayValue({ amountInCents: summary.bill.totalAmountInCents })}</p>
        </header>

        {summary.participants.map((participant) => (
          <div key={participant.participantId}>
            <strong>{participant.displayName}</strong>
            <span> R$ {centsToDisplayValue({ amountInCents: participant.amountInCents })}</span>

            <ul>
              {participant.items.map((item) => (
                <li key={item.billItemId}>
                  {item.description} — R$ {centsToDisplayValue({ amountInCents: item.amountInCents })}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {summary.hasUnclaimedItems && <p>Existem itens sem dono ainda.</p>}

      <button onClick={exportSummaryAsImage}>Exportar como imagem</button>
    </motion.div>
  );
}