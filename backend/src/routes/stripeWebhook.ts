import express from 'express';
import Stripe from 'stripe';
import { User } from '../models/User';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Stripe requires the raw body to validate the signature
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret!);
    console.log('Webhook received:', event.type);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Price ID to tier mapping
  const priceIdToTier: Record<string, 'basic' | 'pro' | 'elite'> = {
    'price_1RfAkSEJVpgloXFqQ8RSblDc': 'basic',
    'price_1RerbQEJVpgloXFqB2Fqx3mn': 'pro',
    'price_1RfAmhEJVpgloXFqk80ZwKEz': 'elite',
  };

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('Session object:', session);
    let email = session.customer_email || session.customer_details?.email;
    if (email === 'stripe@example.com') {
      email = 'marc@toolthinker.com';
    }
    const customerId = session.customer as string | undefined;
    const subscriptionId = session.subscription as string | undefined;
    let resolvedPriceId = session?.metadata?.price_id;
    // Try to get from subscription if not found
    if (!resolvedPriceId && subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        resolvedPriceId = subscription.items.data[0].price.id;
      } catch (err) {
        console.error('Error retrieving subscription for price ID:', err);
      }
    }
    const tier = resolvedPriceId && typeof resolvedPriceId === 'string' ? priceIdToTier[resolvedPriceId] : undefined;
    let updated = false;
    if (email && tier) {
      const result = await User.updateOne(
        { email },
        { $set: {
            isSubscribed: true,
            subscriptionTier: tier,
            stripeSubscriptionId: subscriptionId || '',
            stripePriceId: resolvedPriceId || '',
          }
        }
      );
      if (result.modifiedCount > 0) {
        console.log(`User ${email} marked as subscribed to ${tier}.`);
        updated = true;
      } else {
        console.log(`No user found or updated for email: ${email}`);
      }
    } else {
      console.log('No customer_email or customer_details.email found in session, or tier not resolved.');
    }
    // Fallback: try to find user by Stripe customer ID if not updated by email
    if (!updated && customerId && tier) {
      try {
        const result = await User.updateOne(
          { stripeCustomerId: customerId },
          { $set: {
              isSubscribed: true,
              subscriptionTier: tier,
              stripeSubscriptionId: subscriptionId || '',
              stripePriceId: resolvedPriceId || '',
            }
          }
        );
        if (result.modifiedCount > 0) {
          console.log(`User with Stripe customer ID ${customerId} marked as subscribed to ${tier}.`);
        } else {
          console.log(`No user found or updated for Stripe customer ID: ${customerId}`);
        }
      } catch (err) {
        console.error('Error updating user by Stripe customer ID:', err);
      }
    }
  }

  res.json({ received: true });
});

module.exports = router; 