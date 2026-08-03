export function distributeCentsByLargestRemainder({
  totalInCents,
  weights,
}: {
  totalInCents: number;
  weights: number[];
}): number[] {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  const hasNoWeight = totalWeight === 0;

  if (hasNoWeight) return weights.map(() => 0);

  const rawShares = weights.map((weight) => (totalInCents * weight) / totalWeight);
  const flooredShares = rawShares.map((share) => Math.floor(share));
  const distributedCentsSoFar = flooredShares.reduce((sum, share) => sum + share, 0);
  const remainingCents = totalInCents - distributedCentsSoFar;

  const remaindersByIndex = rawShares
    .map((share, index) => ({ index, remainder: share - flooredShares[index] }))
    .sort((a, b) => b.remainder - a.remainder);

  const finalShares = [...flooredShares];

  for (let i = 0; i < remainingCents; i += 1) {
    finalShares[remaindersByIndex[i].index] += 1;
  }

  return finalShares;
}