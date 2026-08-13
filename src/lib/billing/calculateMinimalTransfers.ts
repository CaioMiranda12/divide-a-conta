export function calculateNetBalances({
  bills,
}: {
  bills: { payer: { displayName: string } | null; debts: { displayName: string; amountOwedInCents: number }[] }[];
}): Map<string, number> {
  const balanceByName = new Map<string, number>();

  function addToBalance(name: string, amountInCents: number) {
    balanceByName.set(name, (balanceByName.get(name) ?? 0) + amountInCents);
  }

  bills.forEach((bill) => {
    if (!bill.payer) return;

    const totalOwedToPayerInCents = bill.debts.reduce((sum, debt) => sum + debt.amountOwedInCents, 0);

    addToBalance(bill.payer.displayName, totalOwedToPayerInCents);

    bill.debts.forEach((debt) => {
      addToBalance(debt.displayName, -debt.amountOwedInCents);
    });
  });

  return balanceByName;
}

export type MinimalTransfer = {
  fromDisplayName: string;
  toDisplayName: string;
  amountInCents: number;
};

export function calculateMinimalTransfers({
  balances,
}: {
  balances: { displayName: string; balanceInCents: number }[];
}): MinimalTransfer[] {
  const creditors = balances
    .filter((balance) => balance.balanceInCents > 0)
    .map((balance) => ({ displayName: balance.displayName, remainingInCents: balance.balanceInCents }))
    .sort((a, b) => b.remainingInCents - a.remainingInCents);

  const debtors = balances
    .filter((balance) => balance.balanceInCents < 0)
    .map((balance) => ({ displayName: balance.displayName, remainingInCents: -balance.balanceInCents }))
    .sort((a, b) => b.remainingInCents - a.remainingInCents);

  const transfers: MinimalTransfer[] = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const transferAmountInCents = Math.min(creditor.remainingInCents, debtor.remainingInCents);
    const hasAmountToTransfer = transferAmountInCents > 0;

    if (hasAmountToTransfer) {
      transfers.push({
        fromDisplayName: debtor.displayName,
        toDisplayName: creditor.displayName,
        amountInCents: transferAmountInCents,
      });
    }

    creditor.remainingInCents -= transferAmountInCents;
    debtor.remainingInCents -= transferAmountInCents;

    if (creditor.remainingInCents === 0) creditorIndex += 1;
    if (debtor.remainingInCents === 0) debtorIndex += 1;
  }

  return transfers;
}