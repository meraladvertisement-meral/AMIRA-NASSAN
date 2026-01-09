import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db, auth } from "./firebase";
import { Entitlement, GuestUsage, PlayPack } from '../types/billing';

const STORAGE_KEY = 'sqg_billing_v2';
const GUEST_STORAGE_KEY = 'sqg_guest_usage';

export const billingService = {
  // We can't use await here without making it async, 
  // so we'll fetch sync from LocalStorage and App.tsx will handle the sync from Firestore.
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
    let data = JSON.parse(saved);
    if (data.lastDailyReset < today) {
      data.dailyFreeRemaining = 3;
      data.lastDailyReset = today;
    }
    return data;
  },

  save(ent: Entitlement) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ent));
  },

  // Add bonus plays to the user's current entitlement and save locally
  addBonusPlays(count: number) {
    const ent = this.getEntitlement();
    ent.bonusPlays += count;
    this.save(ent);
  },

  // This will be called by App.tsx whenever Firebase Auth or User Doc changes
  syncFromFirestore(userData: any) {
    if (!userData) return;
    const current = this.getEntitlement();
    const synced: Entitlement = {
      ...current,
      planId: userData.subscription?.plan || 'free',
      cycle: userData.subscription?.period || 'monthly',
      bonusPlays: userData.soloPlaysBalance || 0,
      // Map other fields as needed
    };
    this.save(synced);
  },

  getGuestUsage(): GuestUsage {
    const today = new Date().setHours(0,0,0,0);
    const saved = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!saved) return { dailyPlaysUsed: 0, lastResetTimestamp: today };
    let usage = JSON.parse(saved);
    if (usage.lastResetTimestamp < today) return { dailyPlaysUsed: 0, lastResetTimestamp: today };
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

    if (consumed) this.save(ent);
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