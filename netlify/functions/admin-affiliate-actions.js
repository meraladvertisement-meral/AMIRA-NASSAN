
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) return { statusCode: 401, body: 'Missing Auth' };
    
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const callerUid = decodedToken.uid;

    // Security Check: Verify Admin
    const adminUids = (process.env.ADMIN_UIDS || '').split(',');
    if (!adminUids.includes(callerUid) && decodedToken.email !== 'info@snapquizgame.app') {
      return { statusCode: 403, body: 'Forbidden' };
    }

    const { action, commissionId } = JSON.parse(event.body);

    if (action === 'list_pending') {
      const snap = await db.collection('affiliate_commissions')
        .where('state', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();
      
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return { statusCode: 200, headers, body: JSON.stringify(list) };
    }

    if (action === 'approve') {
      await db.collection('affiliate_commissions').doc(commissionId).update({
        state: 'approved',
        approvedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (action === 'reject') {
      await db.collection('affiliate_commissions').doc(commissionId).update({
        state: 'rejected',
        rejectedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 400, body: 'Unknown Action' };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};
