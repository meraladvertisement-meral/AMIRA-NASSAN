import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from './firebase';
import { billingService } from './billingService';

interface AffiliateData {
  activations: string[];
  pendingBonusCount: number;
  lastBonusReset: number;
  commissions: { id: string; amount: number; state: 'pending' | 'approved' | 'rejected'; createdAt: number }[];
}

const STORAGE_KEY = 'sqg_affiliate';

export const affiliateService = {
  // Sync totals from Firestore for the specific user
  async getLiveTotals(): Promise<{ pending: number, available: number }> {
    const user = auth.currentUser;
    if (!user) return { pending: 0, available: 0 };

    const q = query(collection(db, "affiliate_commissions"), where("referrerUid", "==", user.uid));
    const snap = await getDocs(q);
    
    let pending = 0;
    let available = 0;

    snap.forEach(doc => {
      const data = doc.data();
      if (data.state === 'pending') pending += (data.amount || 0);
      if (data.state === 'approved') available += (data.amount || 0);
    });

    return { pending, available };
  },

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
    return data;
  },

  registerActivation(referredUserId: string) {
    const data = this.getData();
    if (data.activations.includes(referredUserId)) return;
    data.activations.push(referredUserId);
    billingService.addBonusPlays(2);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};