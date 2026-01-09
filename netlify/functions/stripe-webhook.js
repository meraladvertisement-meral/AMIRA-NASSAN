
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  let stripeEvent;
  
  const rawBody = event.isBase64Encoded 
    ? Buffer.from(event.body, 'base64') 
    : event.body;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const dataObject = stripeEvent.data.object;
  const uid = dataObject.metadata?.uid;
  const referrerUid = dataObject.metadata?.referrerUid;

  if (!uid) return { statusCode: 200, body: 'Ignored' };

  const userRef = db.collection('users').doc(uid);

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        if (dataObject.mode === 'payment') {
          const sessionWithItems = await stripe.checkout.sessions.retrieve(dataObject.id, {
            expand: ['line_items']
          });
          const priceId = sessionWithItems.line_items.data[0].price.id;
          
          let playsToAdd = 0;
          if (priceId === 'price_1SnR0TGvLCUKCR9vty6XX32N') playsToAdd = 20;
          if (priceId === 'price_1SnRR8GvLCUKCR9vr0VbBn2T') playsToAdd = 100;
          if (priceId === 'price_1SnRSiGvLCUKCR9vKxRbuSnk') playsToAdd = 250;

          if (playsToAdd > 0) {
            await userRef.set({
              soloPlaysBalance: admin.firestore.FieldValue.increment(playsToAdd),
              soloPlaysExpiry: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 182 * 24 * 60 * 60 * 1000)),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          }
        } else if (dataObject.mode === 'subscription' && referrerUid && referrerUid !== uid) {
          // AFFILIATE LOGIC: Create pending commission
          await db.collection('affiliate_commissions').add({
            referrerUid,
            buyerUid: uid,
            amount: 3,
            currency: 'EUR',
            state: 'pending',
            stripeSubscriptionId: dataObject.subscription,
            stripeCustomerId: dataObject.customer,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subPriceId = dataObject.items.data[0].price.id;
        const subStatus = dataObject.status;
        const plan = subPriceId.includes('unlimited') ? 'unlimited' : 'plus';
        const period = subPriceId.includes('yearly') ? 'yearly' : 'monthly';

        await userRef.set({
          subscription: {
            status: subStatus === 'active' || subStatus === 'trialing' ? 'active' : 'inactive',
            plan,
            period,
            stripePriceId: subPriceId,
            stripeSubscriptionId: dataObject.id,
            currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(dataObject.current_period_end * 1000)),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }
        }, { merge: true });
        break;

      case 'customer.subscription.deleted':
        await userRef.set({
          subscription: { status: 'inactive', plan: null, period: null, updatedAt: admin.firestore.FieldValue.serverTimestamp() }
        }, { merge: true });
        break;
    }
  } catch (error) {
    return { statusCode: 500, body: 'Internal Error' };
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
