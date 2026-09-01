import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase'; // Assuming supabase client is initialized here

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-razorpay-signature') as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // For local testing without a proper webhook secret, skip signature verification
    // WARNING: In production, always verify signatures!
    let event: any;
    
    if (!webhookSecret || webhookSecret === 'dummy_secret') {
      event = JSON.parse(payload);
    } else {
      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('Invalid Razorpay signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
      
      event = JSON.parse(payload);
    }

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const notes = payment.notes;
      const purchase_id = notes?.purchase_id;

      if (purchase_id) {
        // Update purchase status in Supabase
        const { error } = await supabase
          .from('purchases')
          .update({ status: 'Delivered', payment_method: `Razorpay (Txn: ${payment.id})` })
          .eq('id', purchase_id);

        if (error) {
          console.error('Error updating purchase:', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
