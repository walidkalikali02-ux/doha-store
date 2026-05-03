import {PointsBalance} from '@/components/loyalty/PointsBalance';
import {TierProgress} from '@/components/loyalty/TierProgress';
import {PointsHistory} from '@/components/loyalty/PointsHistory';
import {Gift, TrendingUp} from 'lucide-react';

interface LoyaltyData {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tierName: string;
  pointsToNextTier: number;
  totalEarned: number;
  currentTierMin: number;
  nextTierMin: number;
}

interface PointsTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'referral';
  description: string;
  points: number;
  balance: number;
  createdAt: string;
}

export function Loyalty() {
  // Mock data - would come from API
  const loyaltyData: LoyaltyData = {
    points: 2450,
    tier: 'silver',
    tierName: 'Silver Member',
    pointsToNextTier: 550,
    totalEarned: 8750,
    currentTierMin: 1000,
    nextTierMin: 3000,
  };

  const recentTransactions: PointsTransaction[] = [
    {
      id: '1',
      type: 'earned',
      description: 'Purchase: Ethiopian Yirgacheffe',
      points: 45,
      balance: 2450,
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      type: 'redeemed',
      description: 'Redeemed at checkout',
      points: -100,
      balance: 2405,
      createdAt: '2024-01-14T15:20:00Z',
    },
    {
      id: '3',
      type: 'bonus',
      description: 'Welcome bonus',
      points: 500,
      balance: 2505,
      createdAt: '2024-01-10T09:00:00Z',
    },
  ];

  const tierBenefits = [
    {tier: 'bronze', name: 'Bronze', minPoints: 0, benefits: ['1 point per $1', 'Birthday bonus']},
    {
      tier: 'silver',
      name: 'Silver',
      minPoints: 1000,
      benefits: ['1.5 points per $1', '5% birthday discount', 'Early access'],
    },
    {
      tier: 'gold',
      name: 'Gold',
      minPoints: 3000,
      benefits: ['2 points per $1', '10% birthday discount', 'Free shipping', 'Exclusive offers'],
    },
    {
      tier: 'platinum',
      name: 'Platinum',
      minPoints: 5000,
      benefits: [
        '3 points per $1',
        '15% birthday discount',
        'Free shipping',
        'VIP support',
        'Double points events',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Loyalty Rewards</h1>
          <p className="mt-1 text-sm text-gray-500">
            Earn points with every purchase and unlock exclusive benefits
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PointsBalance
              points={loyaltyData.points}
              tierName={loyaltyData.tierName}
              totalEarned={loyaltyData.totalEarned}
            />

            <TierProgress
              currentTier={loyaltyData.tier}
              pointsToNextTier={loyaltyData.pointsToNextTier}
              currentPoints={loyaltyData.points}
              currentTierMin={loyaltyData.currentTierMin}
              nextTierMin={loyaltyData.nextTierMin}
            />

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Tier Benefits</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tierBenefits.map(tier => (
                  <div
                    key={tier.tier}
                    className={`p-4 rounded-lg border ${
                      tier.tier === loyaltyData.tier
                        ? 'border-coffee-600 bg-coffee-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <h3 className="font-medium text-gray-900">{tier.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{tier.minPoints}+ points</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx}>• {benefit}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">How to Earn</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-coffee-100 rounded-full flex items-center justify-center">
                    <Gift className="h-5 w-5 text-coffee-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Make Purchases</p>
                    <p className="text-sm text-gray-500">
                      Earn 1-3 points per $1 spent based on tier
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-coffee-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-coffee-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Refer Friends</p>
                    <p className="text-sm text-gray-500">Get 500 bonus points per referral</p>
                  </div>
                </div>
              </div>
            </div>

            <PointsHistory transactions={recentTransactions} />
          </div>
        </div>
      </div>
    </div>
  );
}
