
export type PlanId = 'free' | 'plus' | 'unlimited';
export type BillingCycle = 'monthly' | 'yearly';

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

export interface ConsentLog {
  type: "subscription_immediate_start" | "packs_immediate_supply";
  accepted: boolean;
  acceptedAt: number;
  uiLang: string;
}

export interface RefundRequest {
  id: string;
  uid: string;
  createdAt: number;
  orderType: "subscription" | "pack";
  pricePaid: number;
  deduction: number;
  refundAmount: number;
  status: "requested" | "approved" | "rejected" | "paid";
}
