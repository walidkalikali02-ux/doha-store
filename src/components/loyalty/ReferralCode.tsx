import {useState} from 'react';
import {Copy, Check, Gift} from 'lucide-react';

interface ReferralCodeProps {
  referralCode: string;
  referralLink: string;
  onCopyCode?: () => void;
  onCopyLink?: () => void;
}

export function ReferralCode({
  referralCode,
  referralLink,
  onCopyCode,
  onCopyLink,
}: ReferralCodeProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    onCopyCode?.();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    onCopyLink?.();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0 w-10 h-10 bg-coffee-100 rounded-full flex items-center justify-center">
          <Gift className="h-5 w-5 text-coffee-600" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900">Your Referral Code</h2>
          <p className="text-sm text-gray-500">Share with friends to earn 500 bonus points each</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code</label>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg font-semibold text-gray-900">
              {referralCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors flex items-center gap-2"
            >
              {copiedCode ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Referral Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Your friend gets <span className="font-semibold text-gray-900">10% off</span> their first
          order, and you get <span className="font-semibold text-gray-900">500 points</span> when
          they complete their purchase.
        </p>
      </div>
    </div>
  );
}
