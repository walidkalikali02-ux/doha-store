import {useState} from 'react';
import {Mail, Link2, Facebook, Twitter} from 'lucide-react';

interface ReferralShareProps {
  referralLink: string;
  referralCode: string;
  onShareEmail?: () => void;
  onShareSocial?: (platform: string) => void;
}

export function ReferralShare({
  referralLink,
  referralCode,
  onShareEmail,
  onShareSocial,
}: ReferralShareProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const shareMessage = `Join me at The Roastery and get 10% off your first order! Use my referral code: ${referralCode}`;

  const handleEmailSubmit = async () => {
    if (!email) return;
    setSending(true);
    try {
      // In real app, would send email via API
      await new Promise(resolve => setTimeout(resolve, 1000));
      onShareEmail?.();
      setEmail('');
      setShowEmailForm(false);
    } catch {
      // Handle error
    } finally {
      setSending(false);
    }
  };

  const handleSocialShare = (platform: string) => {
    let url = '';
    const encodedLink = encodeURIComponent(referralLink);
    const encodedMessage = encodeURIComponent(shareMessage);

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedMessage}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedLink}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      onShareSocial?.(platform);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Share Your Referral</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setShowEmailForm(!showEmailForm)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
        >
          <Mail className="h-5 w-5" />
          Email
        </button>

        <button
          onClick={() => handleSocialShare('facebook')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Facebook className="h-5 w-5" />
          Facebook
        </button>

        <button
          onClick={() => handleSocialShare('twitter')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
        >
          <Twitter className="h-5 w-5" />
          Twitter
        </button>
      </div>

      {showEmailForm && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Friend's Email Address
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="friend@email.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
            />
            <button
              onClick={handleEmailSubmit}
              disabled={!email || sending}
              className="px-6 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            We'll send your friend an email with your referral code. They'll get 10% off their first
            order.
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Or copy and share your link:</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600 truncate">
            {referralLink}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(referralLink);
            }}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Copy link"
          >
            <Link2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
