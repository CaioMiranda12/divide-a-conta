'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMergedBillSummary } from '@/hooks/useMergedBillSummary';
import { centsToDisplayValue } from '@/utils/currency';

const MIN_BILLS_TO_MERGE = 2;

export function MergedBillSummaryView() {
  const searchParams = useSearchParams();
  const billIdsParam = searchParams.get('billIds') ?? '';
  const billIds = billIdsParam.split(',').filter(Boolean);

  const hasEnoughBills = billIds.length >= MIN_BILLS_TO_MERGE;

  const { summary, isLoading, errorCode } = useMergedBillSummary({ billIdsParam: hasEnoughBills ? billIdsParam : '' });

  if (!hasEnoughBills) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="font-body text-sm text-secondary">Selecione pelo menos duas contas para combinar.</p>
        <Link href="/bills/merge" className="mt-3 inline-block text-sm font-body text-mint hover:text-mint-mid">
          Escolher contas
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <p className="max-w-md mx-auto px-4 py-16 text-center font-body text-sm text-secondary">Carregando...</p>;
  }

  if (errorCode || !summary) {
    return (
      <p className="max-w-md mx-auto px-4 py-16 text-center font-body text-sm text-negative">
        Não foi possível carregar o resumo combinado.
      </p>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Link href="/bills/merge" className="text-sm font-body text-secondary hover:text-primary">
        ← Escolher outras contas
      </Link>

      <h1 className="font-body text-2xl font-semibold tracking-tight text-primary mt-4 mb-6">Resumo combinado</h1>

      <div className="bg-panel-raised border border-subtle rounded-3xl p-6">
        <div className="flex items-stretch divide-x divide-subtle border-b border-subtle pb-4">
          <div className="flex-1 text-center px-2">
            <p className="text-xs font-body text-secondary">Total combinado</p>
            <p className="mt-1 font-money text-lg text-primary tabular-nums">
              R$ {centsToDisplayValue({ amountInCents: summary.combinedTotalInCents })}
            </p>
          </div>
          <div className="flex-1 text-center px-2">
            <p className="text-xs font-body text-secondary">Contas</p>
            <p className="mt-1 font-money text-lg text-primary tabular-nums">{summary.bills.length}</p>
          </div>
          <div className="flex-1 text-center px-2">
            <p className="text-xs font-body text-secondary">Pessoas</p>
            <p className="mt-1 font-money text-lg text-primary tabular-nums">{summary.combinedParticipants.length}</p>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {summary.combinedParticipants.map((participant) => (
            <div key={participant.displayName}>
              <div className="flex items-baseline justify-between">
                <strong className="font-body text-sm font-semibold text-primary">{participant.displayName}</strong>
                <span className="font-money text-sm tabular-nums text-primary">
                  R$ {centsToDisplayValue({ amountInCents: participant.totalAmountInCents })}
                </span>
              </div>

              <ul className="mt-1 space-y-0.5">
                {participant.bills.map((billEntry) => (
                  <li
                    key={billEntry.billId}
                    className="flex items-baseline justify-between text-sm text-secondary font-money"
                  >
                    <span className="truncate pr-2">{billEntry.restaurantName ?? 'Conta sem nome'}</span>
                    <span className="tabular-nums shrink-0">
                      R$ {centsToDisplayValue({ amountInCents: billEntry.amountInCents })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <h2 className="font-body text-xs uppercase tracking-widest text-secondary mt-8 mb-3">Detalhe por conta</h2>

      <div className="space-y-3">
        {summary.bills.map((bill) => (
          <div key={bill.billId} className="bg-panel border border-subtle rounded-2xl p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-body text-sm text-primary">{bill.restaurantName ?? 'Conta sem nome'}</span>
              <span className="font-money text-sm tabular-nums text-secondary">
                R$ {centsToDisplayValue({ amountInCents: bill.totalAmountInCents })}
              </span>
            </div>

            {bill.payer && (
              <p className="mt-1 text-xs font-body text-secondary">Pago por {bill.payer.displayName}</p>
            )}

            {bill.payer && bill.debts.length > 0 && (
              <div className="mt-2 flex items-center gap-4 text-xs font-money tabular-nums">
                <span className="text-mint">Pago: R$ {centsToDisplayValue({ amountInCents: bill.paidInCentsForBill })}</span>
                <span className="text-negative">Resta: R$ {centsToDisplayValue({ amountInCents: bill.remainingInCentsForBill })}</span>
              </div>
            )}

            {bill.hasUnclaimedItems && (
              <p className="mt-1 text-xs font-body text-secondary">Existem itens sem dono nessa conta.</p>
            )}

            {bill.payer && bill.debts.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                <li className="flex items-baseline justify-between text-xs font-money text-secondary line-through">
                    <span>{bill.payer.displayName} (Autor)</span>
                    <span className="tabular-nums">
                      R$ {centsToDisplayValue({ amountInCents: bill.totalAmountInCents - bill.debts.reduce((sum, debt) => sum + debt.amountOwedInCents, 0) })}
                    </span>
                  </li>

                {bill.debts.map((debt) => (
                  <li
                    key={debt.participantId}
                    className={`flex items-baseline justify-between text-xs font-money ${
                      debt.hasPaid ? 'text-secondary line-through' : 'text-primary'
                    }`}
                  >
                    <span>{debt.displayName}</span>
                    <span className="tabular-nums">
                      R$ {centsToDisplayValue({ amountInCents: debt.amountOwedInCents })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <h2 className="font-body text-xs uppercase tracking-widest text-secondary mt-8 mb-3">Saldos atuais</h2>

      <div className="bg-panel border border-subtle rounded-2xl divide-y divide-subtle">
        {summary.balances.map((balance) => {
          const isPositive = balance.balanceInCents > 0;
          const isNegative = balance.balanceInCents < 0;

          return (
            <div key={balance.displayName} className="flex items-center justify-between px-4 py-2.5">
              <span className="font-body text-sm text-primary">{balance.displayName}</span>
              <span
                className={`font-money text-sm tabular-nums ${
                  isPositive ? 'text-mint' : isNegative ? 'text-negative' : 'text-secondary'
                }`}
              >
                {isPositive ? '+' : ''}R$ {centsToDisplayValue({ amountInCents: balance.balanceInCents })}
              </span>
            </div>
          );
        })}
      </div>

      <h2 className="font-body text-xs uppercase tracking-widest text-secondary mt-8 mb-3">
        Transferências mínimas necessárias
      </h2>

      {summary.minimalTransfers.length === 0 ? (
        <p className="font-body text-sm text-secondary">Ninguém precisa transferir nada.</p>
      ) : (
        <div className="bg-panel border border-subtle rounded-2xl divide-y divide-subtle">
          {summary.minimalTransfers.map((transfer, index) => (
            <div key={index} className="flex items-center justify-between px-4 py-2.5">
              <span className="font-body text-sm text-primary">
                {transfer.fromDisplayName} <span className="text-secondary">→</span> {transfer.toDisplayName}
              </span>
              <span className="font-money text-sm tabular-nums text-mint">
                R$ {centsToDisplayValue({ amountInCents: transfer.amountInCents })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}