import Stripe from 'stripe';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  });
}

const db = admin.firestore();

const PRICE_MAP = {
  'price_1SnPldGvLCUKCR9vpV4CdIHs': { plan: 'plus', period: 'monthly' },
  'price_1SnPtJGvLCUKCR9vJVjo8FB1': { plan: 'plus', period: 'yearly' },
  'price_1SnPmqGvLCUKCR9vtyWXSjRz': { plan: 'unlimited', period: 'monthly' },
  'price_1SnPnRGvLCUKCR9vx4AtlCmF': { plan: 'unlimited', period: 'yearly' },
};

const PACKS_MAP = {
  'price_1SnR0TGvLCUKCR9vty6XX32N': 20,
  'price_1SnRR8GvLCUKCR9vr0VbBn2T': 100,
  'price_1SnRSiGvLCUKCR9vKxRbuSnk': 250,
};

async function resolveUid(dataObject) {
  if (dataObject.metadata?.uid) return dataObject.metadata.uid;
  if (dataObject.customer) {
    try {
      const customerId = typeof dataObject.customer === 'string' ? dataObject.customer : dataObject.customer.id;
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.metadata?.uid) return customer.metadata.uid;
    } catch (e) {}
  }
  return null;
}

export const handler = async (event) => {
  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  if (!sig) return { statusCode: 400, body: 'Missing Signature' };

  let stripeEvent;
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;

  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const dataObject = stripeEvent.data.object;

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const uid = await resolveUid(dataObject);
        if (uid && dataObject.mode === 'payment') {
          const sessionWithItems = await stripe.checkout.sessions.retrieve(dataObject.id, { expand: ['line_items'] });
          const priceId = sessionWithItems.line_items.data[0].price.id;
          const playsToAdd = PACKS_MAP[priceId] || 0;
          if (playsToAdd > 0) {
            await db.collection('users').doc(uid).set({
              soloPlaysBalance: admin.firestore.FieldValue.increment(playsToAdd),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          }
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const uid = await resolveUid(dataObject);
        if (uid) {
          const subPriceId = dataObject.items.data[0].price.id;
          const planInfo = PRICE_MAP[subPriceId] || { plan: 'plus', period: 'monthly' };
          const isActive = dataObject.status === 'active' || dataObject.status === 'trialing';
          await db.collection('users').doc(uid).set({
            subscription: {
              status: isActive ? 'active' : 'inactive',
              plan: planInfo.plan,
              period: planInfo.period,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }
          }, { merge: true });
        }
        break;
      }
    }
  } catch (error) {
    return { statusCode: 500, body: 'Internal Error' };
  }
  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};