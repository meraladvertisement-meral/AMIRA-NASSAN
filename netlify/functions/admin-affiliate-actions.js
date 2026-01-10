const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const callerUid = decodedToken.uid;

    const adminUids = (process.env.ADMIN_UIDS || '').split(',');
    if (!adminUids.includes(callerUid) && decodedToken.email !== 'info@snapquizgame.app') {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
    }

    const { action, commissionId } = JSON.parse(event.body);

    if (action === 'list_pending') {
      const snap = await db.collection('affiliate_commissions').where('state', '==', 'pending').get();
      return { statusCode: 200, headers, body: JSON.stringify(snap.docs.map(d => ({ id: d.id, ...d.data() }))) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown' }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};