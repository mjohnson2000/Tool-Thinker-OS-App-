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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('Session object:', session);
    // Use customer_email or fallback to customer_details.email
    let email = session.customer_email || session.customer_details?.email;
    // Map Stripe CLI test email to your real test user for local development
    if (email === 'stripe@example.com') {
      email = 'marc@toolthinker.com';
    }
    const customerId = session.customer as string | undefined;
    let updated = false;
    if (email) {
      const result = await User.updateOne({ email }, { $set: { isSubscribed: true } });
      if (result.modifiedCount > 0) {
        console.log(`User ${email} marked as subscribed.`);
        updated = true;
      } else {
        console.log(`No user found or updated for email: ${email}`);
      }
    } else {
      console.log('No customer_email or customer_details.email found in session.');
    }
    // Fallback: try to find user by Stripe customer ID if not updated by email
    if (!updated && customerId) {
      try {
        // Assuming you store stripeCustomerId on the user model
        const result = await User.updateOne({ stripeCustomerId: customerId }, { $set: { isSubscribed: true } });
        if (result.modifiedCount > 0) {
          console.log(`User with Stripe customer ID ${customerId} marked as subscribed.`);
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