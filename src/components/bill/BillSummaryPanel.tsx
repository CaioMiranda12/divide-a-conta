'use client';

import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { motion } from 'framer-motion';
import { useBillSummary } from '@/hooks/useBillSummary';
import { centsToDisplayValue } from '@/utils/currency';

const EXPORT_IMAGE_FILE_NAME = 'resumo-divide-a-conta.png';
const RING_RADIUS = 34;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function BillSummaryPanel({ billId }: { billId: string }) {
  const { summary, isLoading } = useBillSummary({ billId, isEnabled: true });
  const summaryRef = useRef<HTMLDivElement>(null);

  async function exportSummaryAsImage() {
    const summaryElement = summaryRef.current;

    if (!summaryElement) return;

    const imageDataUrl = await toPng(summaryElement, { backgroundColor: '#0D1815' });

    const downloadLink = document.createElement('a');
    downloadLink.href = imageDataUrl;
    downloadLink.download = EXPORT_IMAGE_FILE_NAME;
    downloadLink.click();
  }

  if (isLoading || !summary) {
    return <p className="font-body text-sm text-secondary mt-6">Carregando resumo...</p>;
  }

  const claimedPercentage = summary.claimStats.totalItemsCount === 0
    ? 0
    : Math.round((summary.claimStats.claimedItemsCount / summary.claimStats.totalItemsCount) * 100);
  const ringOffset = RING_CIRCUMFERENCE - (claimedPercentage / 100) * RING_CIRCUMFERENCE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6"
    >
      <div ref={summaryRef} className="bg-panel-raised border border-subtle rounded-3xl p-6">
        <h2 className="font-body text-lg font-semibold text-primary text-center">
          {summary.bill.restaurantName ?? 'Conta sem nome'}
        </h2>

        <div className="mt-5 flex items-stretch divide-x divide-subtle border-y border-subtle py-4">
          <div className="flex-1 text-center px-2">
            <p className="text-xs font-body text-secondary">Total</p>
            <p className="mt-1 font-money text-lg text-primary tabular-nums">
              R$ {centsToDisplayValue({ amountInCents: summary.bill.totalAmountInCents })}
            </p>
          </div>
          <div className="flex-1 text-center px-2">
            <p className="text-xs font-body text-secondary">Comensais</p>
            <p className="mt-1 font-money text-lg text-primary tabular-nums">{summary.participants.length}</p>
          </div>
          <div className="flex-1 text-center px-2">
            <p className="text-xs font-body text-secondary">Itens</p>
            <p className="mt-1 font-money text-lg text-primary tabular-nums">
              {summary.claimStats.claimedItemsCount}/{summary.claimStats.totalItemsCount}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={RING_RADIUS} fill="none" stroke="var(--color-subtle)" strokeWidth="8" />
            <circle
              cx="48"
              cy="48"
              r={RING_RADIUS}
              fill="none"
              stroke="var(--color-mint)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
              transform="rotate(-90 48 48)"
            />
            <text x="48" y="53" textAnchor="middle" fill="var(--color-primary)" fontSize="20" fontFamily="var(--font-money)">
              {claimedPercentage}%
            </text>
          </svg>
          <p className="mt-1 text-xs font-body text-secondary">itens atribuídos</p>
        </div>

        <div className="mt-6 space-y-5">
          {summary.participants.map((participant) => (
            <div key={participant.participantId}>
              <div className="flex items-baseline justify-between">
                <strong className="font-body text-sm font-semibold text-primary">{participant.displayName}</strong>
                <span className="font-money text-sm tabular-nums text-primary">
                  R$ {centsToDisplayValue({ amountInCents: participant.amountInCents })}
                </span>
              </div>

              <ul className="mt-1 space-y-0.5">
                {participant.items.map((item) => (
                  <li
                    key={item.billItemId}
                    className="flex items-baseline justify-between text-sm text-secondary font-money"
                  >
                    <span className="truncate pr-2">{item.description}</span>
                    <span className="tabular-nums shrink-0">
                      R$ {centsToDisplayValue({ amountInCents: item.amountInCents })}
                    </span>
                  </li>
                ))}

                {participant.serviceFeeInCents > 0 && (
                  <li className="flex items-baseline justify-between text-sm text-secondary font-money">
                    <span className="truncate pr-2">
                      Taxa de serviço ({summary.bill.serviceFeePercent ?? 0}%)
                    </span>
                    <span className="tabular-nums shrink-0">
                      R$ {centsToDisplayValue({ amountInCents: participant.serviceFeeInCents })}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {summary.payer && summary.debts.length > 0 && (
          <div className="mt-5 pt-4 border-t border-subtle">
            <p className="font-body text-sm font-semibold text-primary mb-2">
              Deve para {summary.payer.displayName}
            </p>

            <ul className="space-y-1">
              {summary.debts.map((debt) => (
                <li key={debt.participantId} className="flex items-baseline justify-between font-money text-sm text-primary">
                  <span>{debt.displayName}</span>
                  <span className="tabular-nums">
                    R$ {centsToDisplayValue({ amountInCents: debt.amountOwedInCents })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {summary.hasUnclaimedItems && (
        <p className="mt-3 text-sm text-secondary font-body">Existem itens sem dono ainda.</p>
      )}

      <button
        onClick={exportSummaryAsImage}
        className="mt-4 w-full bg-mint hover:bg-mint-mid text-on-accent font-body font-semibold rounded-xl py-2.5 transition-colors"
      >
        Exportar como imagem
      </button>
    </motion.div>
  );
}