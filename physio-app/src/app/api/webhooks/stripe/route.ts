import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase'; // Assuming supabase client is initialized here

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-07-29.dahlia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!endpointSecret || endpointSecret === 'whsec_YourStripeWebhookSecretHere') {
      // For local testing without a proper webhook secret, we skip signature verification
      // WARNING: In production, always verify signatures.
      event = JSON.parse(payload) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Retrieve metadata we set during checkout creation
    const purchase_id = session.metadata?.purchase_id;

    if (purchase_id) {
      // Update the purchase status in Supabase to 'Paid'
      const { error } = await supabase
        .from('purchases')
        .update({ status: 'Paid', stripe_payment_id: session.payment_intent as string || session.id })
        .eq('id', purchase_id);

      if (error) {
        console.error('Error updating purchase status in Supabase:', error);
      } else {
        console.log(`Successfully updated purchase ${purchase_id} to Paid`);
      }

      // We can also trigger SMS here if we extract the phone number or call the SMS endpoint internally
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
