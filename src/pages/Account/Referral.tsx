import {ReferralCode} from '@/components/loyalty/ReferralCode';
import {ReferralShare} from '@/components/loyalty/ReferralShare';
import {ReferralTracking} from '@/components/loyalty/ReferralTracking';

interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalPointsEarned: number;
  referrals: Array<{
    id: string;
    referredEmail: string;
    referredName?: string;
    status: 'pending' | 'completed' | 'expired';
    pointsEarned: number;
    createdAt: string;
    completedAt?: string;
  }>;
}

export function Referral() {
  // Mock data - would come from API
  const referralData: ReferralData = {
    referralCode: 'COFFEE2024',
    referralLink: 'https://roastery.com/ref/COFFEE2024',
    totalReferrals: 8,
    pendingReferrals: 3,
    completedReferrals: 5,
    totalPointsEarned: 2500,
    referrals: [
      {
        id: '1',
        referredEmail: 'john@example.com',
        referredName: 'John D.',
        status: 'completed',
        pointsEarned: 500,
        createdAt: '2024-01-10T10:00:00Z',
        completedAt: '2024-01-12T14:30:00Z',
      },
      {
        id: '2',
        referredEmail: 'sarah@example.com',
        status: 'pending',
        pointsEarned: 0,
        createdAt: '2024-01-15T09:00:00Z',
      },
      {
        id: '3',
        referredEmail: 'mike@example.com',
        referredName: 'Mike S.',
        status: 'completed',
        pointsEarned: 500,
        createdAt: '2024-01-08T11:00:00Z',
        completedAt: '2024-01-09T16:00:00Z',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Referral Program</h1>
          <p className="mt-1 text-sm text-gray-500">
            Invite friends and earn 500 points for each successful referral
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ReferralCode
              referralCode={referralData.referralCode}
              referralLink={referralData.referralLink}
            />

            <ReferralShare
              referralCode={referralData.referralCode}
              referralLink={referralData.referralLink}
            />

            <div className="bg-coffee-50 rounded-lg border border-coffee-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">How It Works</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-coffee-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  Share your unique referral code or link with friends
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-coffee-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  Your friend gets 10% off their first order
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-coffee-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  You earn 500 points when they complete their purchase
                </li>
              </ul>
            </div>
          </div>

          <div>
            <ReferralTracking
              referrals={referralData.referrals}
              totalReferrals={referralData.totalReferrals}
              pendingReferrals={referralData.pendingReferrals}
              completedReferrals={referralData.completedReferrals}
              totalPointsEarned={referralData.totalPointsEarned}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
