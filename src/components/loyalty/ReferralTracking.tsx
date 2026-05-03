import {Users, Gift, Clock, CheckCircle, XCircle} from 'lucide-react';

interface Referral {
  id: string;
  referredEmail: string;
  referredName?: string;
  status: 'pending' | 'completed' | 'expired';
  pointsEarned: number;
  createdAt: string;
  completedAt?: string;
}

interface ReferralTrackingProps {
  referrals: Referral[];
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalPointsEarned: number;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function maskEmail(email: string) {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [localPart, domain] = parts as [string, string];
  const masked = localPart.slice(0, 2) + '***' + localPart.slice(-1);
  return `${masked}@${domain}`;
}

const statusConfig = {
  pending: {icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending'},
  completed: {icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed'},
  expired: {icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Expired'},
};

export function ReferralTracking({
  referrals,
  totalReferrals,
  pendingReferrals,
  completedReferrals,
  totalPointsEarned,
}: ReferralTrackingProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Your Referrals</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{totalReferrals}</p>
          <p className="text-xs text-gray-500">Total Referrals</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{pendingReferrals}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{completedReferrals}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="text-center p-3 bg-coffee-50 rounded-lg">
          <p className="text-2xl font-bold text-coffee-600">{totalPointsEarned.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Points Earned</p>
        </div>
      </div>

      {referrals.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No referrals yet</p>
          <p className="text-sm text-gray-400">Share your referral code to start earning points!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {referrals.map(referral => {
            const config = statusConfig[referral.status];
            const Icon = config.icon;

            return (
              <div
                key={referral.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${config.bg} rounded-full flex items-center justify-center`}
                  >
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {referral.referredName || maskEmail(referral.referredEmail)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(referral.createdAt)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
                  >
                    {config.label}
                  </span>
                  {referral.status === 'completed' && (
                    <p className="text-sm font-medium text-green-600 mt-1">
                      +{referral.pointsEarned} pts
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <Gift className="h-3 w-3 inline mr-1" />
          Referral points are credited after your friend makes their first purchase
        </p>
      </div>
    </div>
  );
}
