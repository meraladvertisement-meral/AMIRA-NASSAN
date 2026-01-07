
export type PlanId = 'free' | 'plus' | 'unlimited';
export type BillingCycle = 'monthly' | 'yearly';

export interface GuestUsage {
  dailyPlaysUsed: number;
  lastResetTimestamp: number;
}

export interface PlayPack {
  id: string;
  count: number;
  purchasedAt: number;
  expiresAt: number;
  used: number;
}

export interface Entitlement {
  planId: PlanId;
  cycle: BillingCycle;
  dailyFreeRemaining: number;
  bonusPlays: number;
  packs: PlayPack[];
  subMonthlyPlaysUsed: number;
  teacherQuotasUsed: number;
  lastDailyReset: number;
  lastMonthlyReset: number;
  subscriptionStartAt?: number;
}
