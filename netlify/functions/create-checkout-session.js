
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  });
}

const SUBSCRIPTION_PRICES = [
  'price_1SnPldGvLCUKCR9vpV4CdIHs',
  'price_1SnPtJGvLCUKCR9vJVjo8FB1',
  'price_1SnPmqGvLCUKCR9vtyWXSjRz',
  'price_1SnPnRGvLCUKCR9vx4AtlCmF'
];

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { priceId, referrerUid } = JSON.parse(event.body);
    
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const isSubscription = SUBSCRIPTION_PRICES.includes(priceId);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:8888';

    const metadata = { uid };
    // Level 1 metadata: Store referrer for later use in webhook
    if (referrerUid) {
      metadata.referrerUid = referrerUid;
    }

    const sessionConfig = {
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata,
      allow_promotion_codes: true,
    };

    if (isSubscription) {
      sessionConfig.subscription_data = {
        metadata
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
