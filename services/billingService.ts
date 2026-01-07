
import { Entitlement, GuestUsage, PlayPack } from '../types/billing';

const STORAGE_KEY = 'sqg_billing_v2';
const GUEST_STORAGE_KEY = 'sqg_guest_usage';

export const billingService = {
  getEntitlement(): Entitlement {
    const saved = localStorage.getItem(STORAGE_KEY);
    const today = new Date().setHours(0,0,0,0);

    const defaultEnt: Entitlement = {
      planId: 'free',
      cycle: 'monthly',
      dailyFreeRemaining: 3,
      bonusPlays: 0,
      packs: [],
      subMonthlyPlaysUsed: 0,
      teacherQuotasUsed: 0,
      lastDailyReset: today,
      lastMonthlyReset: today,
    };

    if (!saved) return defaultEnt;
    let data: Entitlement = JSON.parse(saved);

    if (data.lastDailyReset < today) {
      data.dailyFreeRemaining = 3;
      data.lastDailyReset = today;
    }
    return data;
  },

  // Added save method to persist entitlement state (Fix for PricingPage)
  save(ent: Entitlement) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ent));
  },

  // Added addPack method to handle Play Pack purchases (Fix for PricingPage)
  addPack(count: number) {
    const ent = this.getEntitlement();
    const newPack: PlayPack = {
      id: Math.random().toString(36).substr(2, 9),
      count: count,
      purchasedAt: Date.now(),
      expiresAt: Date.now() + (90 * 24 * 60 * 60 * 1000), // 90 days expiry
      used: 0
    };
    ent.packs.push(newPack);
    this.save(ent);
  },

  // Added addBonusPlays method for referral rewards (Fix for affiliateService)
  addBonusPlays(count: number) {
    const ent = this.getEntitlement();
    ent.bonusPlays += count;
    this.save(ent);
  },

  // نظام تتبع الضيوف غير المسجلين
  getGuestUsage(): GuestUsage {
    const today = new Date().setHours(0,0,0,0);
    const saved = localStorage.getItem(GUEST_STORAGE_KEY);
    
    if (!saved) return { dailyPlaysUsed: 0, lastResetTimestamp: today };
    
    let usage: GuestUsage = JSON.parse(saved);
    if (usage.lastResetTimestamp < today) {
      return { dailyPlaysUsed: 0, lastResetTimestamp: today };
    }
    return usage;
  },

  canGuestPlay(): boolean {
    const usage = this.getGuestUsage();
    return usage.dailyPlaysUsed < 5;
  },

  consumeGuestPlay() {
    const usage = this.getGuestUsage();
    usage.dailyPlaysUsed += 1;
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(usage));
  },

  consumePlay(isAdmin: boolean = false): boolean {
    if (isAdmin) return true;

    const ent = this.getEntitlement();
    if (ent.planId === 'unlimited') return true;

    let consumed = false;
    if (ent.dailyFreeRemaining > 0) {
      ent.dailyFreeRemaining--;
      consumed = true;
    } else if (ent.bonusPlays > 0) {
      ent.bonusPlays--;
      consumed = true;
    } else {
      consumed = this.checkSubscriptionQuota(ent);
    }

    if (consumed) {
      // Updated to use the new save method for consistency
      this.save(ent);
    }
    return consumed;
  },

  checkSubscriptionQuota(ent: Entitlement): boolean {
    if (ent.planId === 'plus') {
      const quota = ent.cycle === 'monthly' ? 200 : 2400;
      if (ent.subMonthlyPlaysUsed < quota) {
        ent.subMonthlyPlaysUsed++;
        return true;
      }
    }
    return false;
  }
};
