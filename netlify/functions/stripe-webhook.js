import Stripe from 'stripe';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  });
}

const db = admin.firestore();

// Explicit Price ID Mappings for Subscriptions
const PRICE_MAP = {
  'price_1SnPldGvLCUKCR9vpV4CdIHs': { plan: 'plus', period: 'monthly' },
  'price_1SnPtJGvLCUKCR9vJVjo8FB1': { plan: 'plus', period: 'yearly' },
  'price_1SnPmqGvLCUKCR9vtyWXSjRz': { plan: 'unlimited', period: 'monthly' },
  'price_1SnPnRGvLCUKCR9vx4AtlCmF': { plan: 'unlimited', period: 'yearly' },
};

// Explicit Price ID Mappings for One-time Play Packs
const PACKS_MAP = {
  'price_1SnR0TGvLCUKCR9vty6XX32N': 20,
  'price_1SnRR8GvLCUKCR9vr0VbBn2T': 100,
  'price_1SnRSiGvLCUKCR9vKxRbuSnk': 250,
};

/**
 * Robustly resolve UID from Stripe objects (Session or Subscription)
 * Fallback to retrieving the Customer if metadata is missing on the object.
 */
async function resolveUid(dataObject) {
  // 1. Try direct metadata on the object
  if (dataObject.metadata?.uid) return dataObject.metadata.uid;

  // 2. Try customer object metadata
  if (dataObject.customer) {
    try {
      const customerId = typeof dataObject.customer === 'string' 
        ? dataObject.customer 
        : dataObject.customer.id;
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.metadata?.uid) return customer.metadata.uid;
    } catch (e) {
      console.error("Error retrieving customer for UID resolution:", e);
    }
  }

  return null;
}

export const handler = async (event) => {
  // Handle case-insensitive headers for the signature
  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  
  if (!sig) {
    return { statusCode: 400, body: 'Missing Stripe Signature' };
  }

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
    console.error("Webhook Signature Verification Failed:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const dataObject = stripeEvent.data.object;

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const uid = await resolveUid(dataObject);
        if (!uid) {
          console.warn("No UID found for completed checkout session:", dataObject.id);
          return { statusCode: 200, body: 'Processed without UID' };
        }

        const userRef = db.collection('users').doc(uid);

        if (dataObject.mode === 'payment') {
          // Handle One-time Play Packs
          const sessionWithItems = await stripe.checkout.sessions.retrieve(dataObject.id, {
            expand: ['line_items']
          });
          const priceId = sessionWithItems.line_items.data[0].price.id;
          const playsToAdd = PACKS_MAP[priceId] || 0;

          if (playsToAdd > 0) {
            await userRef.set({
              soloPlaysBalance: admin.firestore.FieldValue.increment(playsToAdd),
              soloPlaysExpiry: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 182 * 24 * 60 * 60 * 1000)), // 6 months
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`Added ${playsToAdd} plays to user ${uid}`);
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const uid = await resolveUid(dataObject);
        if (!uid) return { statusCode: 200, body: 'No UID associated with subscription event' };

        const userRef = db.collection('users').doc(uid);
        const subPriceId = dataObject.items.data[0].price.id;
        const subStatus = dataObject.status;
        const planInfo = PRICE_MAP[subPriceId] || { plan: 'plus', period: 'monthly' };

        const isActive = subStatus === 'active' || subStatus === 'trialing';

        await userRef.set({
          subscription: {
            status: isActive ? 'active' : 'inactive',
            plan: planInfo.plan,
            period: planInfo.period,
            stripePriceId: subPriceId,
            stripeSubscriptionId: dataObject.id,
            currentPeriodEnd: admin.firestore.Timestamp.fromDate(new Date(dataObject.current_period_end * 1000)),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }
        }, { merge: true });

        // AFFILIATE LOGIC: Create commission only when subscription becomes active/trialing
        // and referrerUid exists and differs from buyer's UID.
        if (isActive) {
          const referrerUid = dataObject.metadata?.referrerUid;
          if (referrerUid && referrerUid !== uid) {
            // Check if this specific subscription already has an associated commission to prevent duplicates on 'updated' events
            const existingComms = await db.collection('affiliate_commissions')
              .where('stripeSubscriptionId', '==', dataObject.id)
              .limit(1)
              .get();

            if (existingComms.empty) {
              await db.collection('affiliate_commissions').add({
                referrerUid,
                buyerUid: uid,
                amount: 3, // Fixed commission amount per policy
                currency: 'EUR',
                state: 'pending',
                stripeSubscriptionId: dataObject.id,
                stripeCustomerId: dataObject.customer,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
              });
              console.log(`Affiliate commission pending for referrer ${referrerUid} from buyer ${uid}`);
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const uid = await resolveUid(dataObject);
        if (!uid) return { statusCode: 200, body: 'No UID found for subscription deletion' };

        const userRef = db.collection('users').doc(uid);
        await userRef.set({
          subscription: { 
            status: 'inactive', 
            plan: null, 
            period: null, 
            updatedAt: admin.firestore.FieldValue.serverTimestamp() 
          }
        }, { merge: true });
        console.log(`Subscription deleted for user ${uid}`);
        break;
      }
    }
  } catch (error) {
    console.error(`Error processing Stripe webhook (${stripeEvent.type}):`, error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
