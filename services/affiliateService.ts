
import { billingService } from './billingService';

interface AffiliateData {
  activations: string[]; // List of referred user IDs
  pendingBonusCount: number;
  lastBonusReset: number;
  commissions: { id: string; amount: number; status: 'pending' | 'approved' | 'rejected'; createdAt: number }[];
}

const STORAGE_KEY = 'sqg_affiliate';

export const affiliateService = {
  getData(): AffiliateData {
    const raw = localStorage.getItem(STORAGE_KEY);
    const defaultData: AffiliateData = {
      activations: [],
      pendingBonusCount: 0,
      lastBonusReset: new Date().setHours(0,0,0,0),
      commissions: []
    };
    if (!raw) return defaultData;
    
    let data = JSON.parse(raw);
    
    // Process Rollover: If a new day has started, move up to 5 from pending to bonus plays
    const today = new Date().setHours(0,0,0,0);
    if (data.lastBonusReset < today) {
      const daysPassed = Math.floor((today - data.lastBonusReset) / (24 * 60 * 60 * 1000));
      for (let i = 0; i < daysPassed; i++) {
        const toApply = Math.min(data.pendingBonusCount, 5);
        if (toApply > 0) {
          billingService.addBonusPlays(toApply * 2);
          data.pendingBonusCount -= toApply;
        }
      }
      data.lastBonusReset = today;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    
    return data;
  },

  registerActivation(referredUserId: string) {
    const data = this.getData();
    if (data.activations.includes(referredUserId)) return;

    data.activations.push(referredUserId);
    
    // Check daily cap (5 activations per day)
    const todayCount = 0; // In a real app, this would be tracked per day in Firestore
    if (todayCount < 5) {
      billingService.addBonusPlays(2);
    } else {
      data.pendingBonusCount += 1; // Rollover for tomorrow
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  addCommission(amount: number = 3) {
    const data = this.getData();
    data.commissions.push({
      id: Math.random().toString(36).substr(2, 9),
      amount,
      status: 'pending',
      createdAt: Date.now()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};
