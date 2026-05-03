import {TIERS, type TierInfo} from './pointsCalculator';

export interface TierEvaluationResult {
  currentTier: TierInfo;
  previousTier: TierInfo | null;
  tierChanged: boolean;
  tierUpgraded: boolean;
  tierDowngraded: boolean;
  pointsToNextTier: number;
  benefits: TierBenefit[];
}

export interface TierBenefit {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface TierThreshold {
  tier: string;
  minPoints: number;
  multiplier: number;
  benefits: string[];
}

const TIER_BENEFITS: Record<string, TierBenefit[]> = {
  bronze: [
    {id: 'points-1x', name: '1x Points', description: 'Earn 1 point per $1 spent', active: true},
    {id: 'birthday', name: 'Birthday Bonus', description: 'Special birthday reward', active: true},
  ],
  silver: [
    {
      id: 'points-1.5x',
      name: '1.5x Points',
      description: 'Earn 1.5 points per $1 spent',
      active: true,
    },
    {
      id: 'birthday-5',
      name: '5% Birthday Discount',
      description: '5% off during your birthday month',
      active: true,
    },
    {
      id: 'early-access',
      name: 'Early Access',
      description: 'Get early access to new products',
      active: true,
    },
  ],
  gold: [
    {id: 'points-2x', name: '2x Points', description: 'Earn 2 points per $1 spent', active: true},
    {
      id: 'birthday-10',
      name: '10% Birthday Discount',
      description: '10% off during your birthday month',
      active: true,
    },
    {
      id: 'free-shipping',
      name: 'Free Shipping',
      description: 'Free standard shipping on all orders',
      active: true,
    },
    {
      id: 'exclusive',
      name: 'Exclusive Offers',
      description: 'Access to gold-only promotions',
      active: true,
    },
  ],
  platinum: [
    {id: 'points-3x', name: '3x Points', description: 'Earn 3 points per $1 spent', active: true},
    {
      id: 'birthday-15',
      name: '15% Birthday Discount',
      description: '15% off during your birthday month',
      active: true,
    },
    {
      id: 'free-shipping',
      name: 'Free Shipping',
      description: 'Free expedited shipping on all orders',
      active: true,
    },
    {id: 'vip', name: 'VIP Support', description: 'Priority customer support', active: true},
    {
      id: 'double-points',
      name: 'Double Points Events',
      description: 'Access to double points events',
      active: true,
    },
  ],
};

export function evaluateTier(currentPoints: number, previousPoints?: number): TierEvaluationResult {
  const currentTier = getTierFromPoints(currentPoints);
  const previousTier = previousPoints !== undefined ? getTierFromPoints(previousPoints) : null;

  const tierChanged = previousTier !== null && previousTier.name !== currentTier.name;
  const tierUpgraded =
    tierChanged && previousTier !== null && currentTier.minPoints > previousTier.minPoints;
  const tierDowngraded =
    tierChanged && previousTier !== null && currentTier.minPoints < previousTier.minPoints;

  const benefits = TIER_BENEFITS[currentTier.name] || [];

  const pointsToNextTier = calculatePointsToNextTier(currentPoints, currentTier);

  return {
    currentTier,
    previousTier,
    tierChanged,
    tierUpgraded,
    tierDowngraded,
    pointsToNextTier,
    benefits,
  };
}

export function getTierFromPoints(points: number): TierInfo {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    const tier = TIERS[i];
    if (tier && points >= tier.minPoints) {
      return tier;
    }
  }
  return TIERS[0]!;
}

export function calculatePointsToNextTier(points: number, currentTier: TierInfo): number {
  const currentIndex = TIERS.findIndex(t => t.name === currentTier.name);

  if (currentIndex === -1 || currentIndex === TIERS.length - 1) {
    return 0;
  }

  const nextTier = TIERS[currentIndex + 1];
  return nextTier ? nextTier.minPoints - points : 0;
}

export function getTierBenefits(tier: string): TierBenefit[] {
  return TIER_BENEFITS[tier] || [];
}

export function calculatePointsMultiplier(tier: string): number {
  const tierInfo = TIERS.find(t => t.name === tier);
  return tierInfo?.multiplier || 1;
}

export function getTierProgress(points: number): {
  currentTier: TierInfo;
  nextTier: TierInfo | null;
  progressPercent: number;
  pointsInCurrentTier: number;
  pointsNeeded: number;
} {
  const currentTier = getTierFromPoints(points);
  const currentIndex = TIERS.findIndex(t => t.name === currentTier.name);
  const nextTier = currentIndex < TIERS.length - 1 ? (TIERS[currentIndex + 1] ?? null) : null;

  const pointsInCurrentTier = points - currentTier.minPoints;
  const tierRange = nextTier ? nextTier.minPoints - currentTier.minPoints : pointsInCurrentTier;
  const pointsNeeded = nextTier ? nextTier.minPoints - points : 0;

  const progressPercent = nextTier ? Math.min(100, (pointsInCurrentTier / tierRange) * 100) : 100;

  return {
    currentTier,
    nextTier,
    progressPercent,
    pointsInCurrentTier,
    pointsNeeded,
  };
}
