import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}
const stripe = new Stripe(stripeSecretKey);

// TODO: Replace with your actual Stripe price ID for the subscription
const STRIPE_PRICE_ID = 'price_1RerbQEJVpgloXFqB2Fqx3mn';

// POST /api/stripe/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  try {
    // In production, get the authenticated user's email from req.user
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout session error:', error);
    res.status(500).json({ error: error.message || 'Failed to create Stripe Checkout session' });
  }
});

// POST /api/stripe/create-customer-portal-session
router.post('/create-customer-portal-session', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    // Find the customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data.length) {
      return res.status(404).json({ error: 'No Stripe customer found for this email' });
    }
    const customer = customers.data[0];
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: req.headers.origin || 'http://localhost:5173',
    });
    res.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Stripe customer portal error:', error);
    res.status(500).json({ error: error.message || 'Failed to create Stripe customer portal session' });
  }
});

module.exports = router; 