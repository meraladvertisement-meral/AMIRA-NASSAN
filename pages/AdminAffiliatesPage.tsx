
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { auth } from '../services/firebase';

interface AdminAffiliatesPageProps {
  onBack: () => void;
  t: any;
}

const AdminAffiliatesPage: React.FC<AdminAffiliatesPageProps> = ({ onBack, t }) => {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('/.netlify/functions/admin-affiliate-actions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ action: 'list_pending' })
      });
      const data = await response.json();
      setCommissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      await fetch('/.netlify/functions/admin-affiliate-actions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ action, commissionId: id })
      });
      setCommissions(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert("Action failed");
    }
  };

  useEffect(() => { fetchPending(); }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic text-brand-gold">Commission Manager</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold">←</button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {loading ? (
          <p className="text-center py-10 opacity-50">Loading pending commissions...</p>
        ) : commissions.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <p className="text-white/20 font-bold uppercase tracking-widest">No pending commissions</p>
          </div>
        ) : (
          commissions.map(c => (
            <GlassCard key={c.id} className="p-4 border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] uppercase font-black text-brand-gold mb-1">Affiliate (Referrer)</p>
                  <p className="text-sm font-mono truncate max-w-[150px]">{c.referrerUid}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-black text-white/30 mb-1">Amount</p>
                  <p className="text-xl font-black text-brand-lime">€{c.amount.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="bg-black/20 p-3 rounded-xl mb-4">
                 <p className="text-[9px] uppercase font-bold text-white/40 mb-1">Buyer: {c.buyerUid}</p>
                 <p className="text-[9px] uppercase font-bold text-white/40">Date: {new Date(c.createdAt?._seconds * 1000).toLocaleString()}</p>
              </div>

              <div className="flex gap-2">
                <ThreeDButton 
                  variant="primary" 
                  className="flex-1 py-2 text-xs" 
                  onClick={() => handleAction(c.id, 'approve')}
                >
                  Approve
                </ThreeDButton>
                <ThreeDButton 
                  variant="danger" 
                  className="flex-1 py-2 text-xs" 
                  onClick={() => handleAction(c.id, 'reject')}
                >
                  Reject
                </ThreeDButton>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAffiliatesPage;
