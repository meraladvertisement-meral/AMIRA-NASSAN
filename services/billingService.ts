import { Entitlement, PlanId, PlayPack } from '../types/billing';

const STORAGE_KEY = 'sqg_billing_v2';

export const billingService = {
  getEntitlement(): Entitlement {
    const saved = localStorage.getItem(STORAGE_KEY);
    const today = new Date().setHours(0,0,0,0);
    const now = Date.now();

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

    // 1. Lazy Daily Reset
    if (data.lastDailyReset < today) {
      data.dailyFreeRemaining = 3;
      data.lastDailyReset = today;
    }

    // 2. Filter Expired Packs (90 days)
    data.packs = data.packs.filter(p => p.expiresAt > now && p.used < p.count);

    return data;
  },

  consumePlay(): boolean {
    const ent = this.getEntitlement();
    
    // Fair Use for Unlimited
    if (ent.planId === 'unlimited') return true;

    // Order: 1. Daily -> 2. Bonus -> 3. Packs -> 4. Subscription
    if (ent.dailyFreeRemaining > 0) {
      ent.dailyFreeRemaining--;
    } else if (ent.bonusPlays > 0) {
      ent.bonusPlays--;
    } else if (ent.packs.length > 0) {
      const activePack = ent.packs.find(p => p.used < p.count);
      if (activePack) activePack.used++;
      else return this.checkSubscriptionQuota(ent);
    } else {
      return this.checkSubscriptionQuota(ent);
    }

    this.save(ent);
    return true;
  },

  // Fix: Removed 'private' modifier which is not allowed in object literal methods.
  checkSubscriptionQuota(ent: Entitlement): boolean {
    if (ent.planId === 'plus') {
      const quota = ent.cycle === 'monthly' ? 200 : 2400;
      if (ent.subMonthlyPlaysUsed < quota) {
        ent.subMonthlyPlaysUsed++;
        this.save(ent);
        return true;
      }
    }
    return false;
  },

  // Fix: Added missing method to handle bonus plays granted via the affiliate program.
  addBonusPlays(count: number) {
    const ent = this.getEntitlement();
    ent.bonusPlays += count;
    this.save(ent);
  },

  calculateRefund(pricePaid: number, planId: PlanId, playsUsed: number, daysUsed: number): number {
    let deduction = 0;
    if (planId === 'plus') {
      deduction = (playsUsed / 200) * pricePaid;
    } else if (planId === 'unlimited') {
      deduction = (daysUsed / 30) * pricePaid;
    }
    return Math.max(0, pricePaid - deduction);
  },

  save(ent: Entitlement) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ent));
  },

  addPack(count: number) {
    const ent = this.getEntitlement();
    const now = Date.now();
    ent.packs.push({
      id: Math.random().toString(36).substr(2,9),
      count,
      used: 0,
      purchasedAt: now,
      expiresAt: now + (90 * 24 * 60 * 60 * 1000)
    });
    this.save(ent);
  }
};