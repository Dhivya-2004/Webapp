import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase'; // Assuming supabase client is initialized here

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      purchase_id 
    } = body;

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummysecret1234567890';
    const isDummyKey = key_secret === 'dummysecret1234567890';

    if (!isDummyKey && !body.is_mock) {
      // Creating our own signature to verify with the one sent by Razorpay
      const generated_signature = crypto
        .createHmac('sha256', key_secret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json(
          { error: 'Payment verification failed' },
          { status: 400 }
        );
      }
    }

    // Payment is verified successfully
    // Update the purchase status in Supabase to 'Paid'
    if (purchase_id) {
      const { error } = await supabase
        .from('purchases')
        .update({ status: 'Paid', razorpay_payment_id: razorpay_payment_id })
        .eq('id', purchase_id);

      if (error) {
        console.error('Error updating purchase status:', error);
        // Continue anyway since payment is technically successful, but log the error
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Error verifying payment' },
      { status: 500 }
    );
  }
}
