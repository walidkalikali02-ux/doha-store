export interface ReferralValidation {
  code: string;
  isValid: boolean;
  referrerName?: string;
  error?: string;
}

export interface ReferralReward {
  referrerPoints: number;
  refereePoints: number;
  referrerTierBonus: number;
}

export const REFERRAL_CONFIG = {
  baseReferrerPoints: 500,
  baseRefereePoints: 500,
  maxPendingDays: 30,
  maxReferralsPerDay: 10,
};

export function validateReferralCodeFormat(code: string): boolean {
  const validPattern = /^[A-Z0-9]{6,12}$/;
  return validPattern.test(code.toUpperCase());
}

export function generateReferralCode(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  const prefix = 'BREW';
  const suffix = Math.abs(hash % 10000)
    .toString()
    .padStart(4, '0');

  return `${prefix}${suffix}`;
}

export function parseReferralLink(link: string): string | null {
  try {
    const url = new URL(link);
    const match = url.pathname.match(/\/ref\/([A-Z0-9]+)/);
    return match ? (match[1] ?? null) : null;
  } catch {
    const match = link.match(/\/ref\/([A-Z0-9]+)/);
    return match ? (match[1] ?? null) : null;
  }
}

export function calculateReferralReward(
  referrerTier: 'bronze' | 'silver' | 'gold' | 'platinum'
): ReferralReward {
  const tierBonus: Record<string, number> = {
    bronze: 0,
    silver: 50,
    gold: 100,
    platinum: 200,
  };

  return {
    referrerPoints: REFERRAL_CONFIG.baseReferrerPoints + (tierBonus[referrerTier] || 0),
    refereePoints: REFERRAL_CONFIG.baseRefereePoints,
    referrerTierBonus: tierBonus[referrerTier] || 0,
  };
}

export function isReferralExpired(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > REFERRAL_CONFIG.maxPendingDays;
}

export function getReferralStatusMessage(status: 'pending' | 'completed' | 'expired'): string {
  const messages = {
    pending: "Your friend has signed up but hasn't made a purchase yet.",
    completed: 'Congratulations! Both you and your friend earned bonus points.',
    expired: "This referral expired because your friend didn't make a purchase within 30 days.",
  };
  return messages[status];
}

export async function checkReferralEligibility(
  _userId: string
): Promise<{eligible: boolean; reason?: string}> {
  return {eligible: true};
}

export function formatReferralForSharing(code: string, medium: 'email' | 'sms' | 'social'): string {
  const link = `https://roastery.com/ref/${code}`;

  switch (medium) {
    case 'email':
      return `Try The Roastery!\n\nUse my referral code ${code} for a special discount on your first order.\n\n${link}`;
    case 'sms':
      return `Use code ${code} for a discount at The Roastery! ${link}`;
    case 'social':
      return `Get a discount at The Roastery with code ${code}! ${link}`;
    default:
      return `${code} - ${link}`;
  }
}
