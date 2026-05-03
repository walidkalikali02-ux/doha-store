export interface PointsCalculation {
  basePoints: number;
  tierMultiplier: number;
  bonusPoints: number;
  referralPoints: number;
  totalPoints: number;
}

export interface TierInfo {
  name: string;
  multiplier: number;
  minPoints: number;
}

export const TIERS: TierInfo[] = [
  {name: 'bronze', multiplier: 1, minPoints: 0},
  {name: 'silver', multiplier: 1.5, minPoints: 1000},
  {name: 'gold', multiplier: 2, minPoints: 3000},
  {name: 'platinum', multiplier: 3, minPoints: 5000},
];

export function getTierByPoints(points: number): TierInfo {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    const tier = TIERS[i];
    if (tier && points >= tier.minPoints) {
      return tier;
    }
  }
  return TIERS[0]!;
}

export function calculatePointsEarned(
  orderTotal: number,
  userPoints: number,
  options?: {
    isFirstPurchase?: boolean;
    hasActiveReferral?: boolean;
    promotionMultiplier?: number;
  }
): PointsCalculation {
  const tier = getTierByPoints(userPoints);
  const tierMultiplier = tier.multiplier;

  let basePoints = Math.floor(orderTotal);

  if (options?.promotionMultiplier) {
    basePoints = Math.floor(basePoints * options.promotionMultiplier);
  }

  const tierBonus = Math.floor(basePoints * (tierMultiplier - 1));

  let bonusPoints = 0;
  if (options?.isFirstPurchase) {
    bonusPoints += 500;
  }

  let referralPoints = 0;
  if (options?.hasActiveReferral) {
    referralPoints += 500;
  }

  const totalPoints = basePoints + tierBonus + bonusPoints + referralPoints;

  return {
    basePoints,
    tierMultiplier,
    bonusPoints,
    referralPoints,
    totalPoints,
  };
}

export function calculatePointsValue(points: number, pointsToDollarRatio: number = 100): number {
  return points / pointsToDollarRatio;
}

export function calculatePointsToRedeem(
  dollarAmount: number,
  pointsToDollarRatio: number = 100,
  maxRedeemable: number
): number {
  const neededPoints = Math.floor(dollarAmount * pointsToDollarRatio);
  return Math.min(neededPoints, maxRedeemable);
}

export function formatPointsDisplay(points: number): string {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  }
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
}

export function getPointsToNextTier(currentPoints: number): {
  pointsNeeded: number;
  nextTier: string | null;
} {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    const tier = TIERS[i];
    if (tier && currentPoints >= tier.minPoints) {
      if (i === TIERS.length - 1) {
        return {pointsNeeded: 0, nextTier: null};
      }
      const nextTier = TIERS[i + 1];
      if (nextTier) {
        return {
          pointsNeeded: nextTier.minPoints - currentPoints,
          nextTier: nextTier.name,
        };
      }
    }
  }
  const firstTier = TIERS[0];
  return firstTier
    ? {pointsNeeded: firstTier.minPoints - currentPoints, nextTier: firstTier.name}
    : {pointsNeeded: 0, nextTier: null};
}
