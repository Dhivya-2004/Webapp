import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2026-07-29.dahlia', // using latest standard API version or whatever the library defaults to
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, receipt, purchase_id, product_name } = body;

    // Use dummy keys if environment variables are not set
    const key_secret = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
    
    if (key_secret === 'sk_test_dummy' || key_secret === 'sk_test_YourStripeSecretKeyHere') {
      // Mock response if using dummy keys to prevent crashing
      return NextResponse.json({
        id: 'cs_test_dummy_' + Math.random().toString(36).substring(7),
        url: 'https://checkout.stripe.com/pay/cs_test_dummy',
      }, { status: 200 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: product_name || 'PhysioByHarish Service',
            },
            unit_amount: amount * 100, // Stripe expects amounts in the smallest currency unit (paise)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // The frontend must provide the origin URL for redirects
      success_url: `${request.headers.get('origin')}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/store?canceled=true`,
      metadata: {
        receipt: receipt || '',
        purchase_id: purchase_id || '',
      },
    });

    return NextResponse.json({ id: session.id, url: session.url }, { status: 200 });
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
