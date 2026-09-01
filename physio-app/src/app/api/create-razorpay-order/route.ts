import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, receipt, purchase_id } = body;

    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';

    if (key_id === 'rzp_test_dummy') {
      // Mock response if using dummy keys to prevent crashing
      return NextResponse.json({
        id: 'order_dummy_' + Math.random().toString(36).substring(7),
        amount: amount * 100,
        currency: 'INR',
      }, { status: 200 });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: receipt || `receipt_${purchase_id || Math.random().toString(36).substring(7)}`,
      notes: {
        purchase_id: purchase_id || '',
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ 
      id: order.id, 
      amount: order.amount,
      currency: order.currency
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating Razorpay order' },
      { status: 500 }
    );
  }
}
