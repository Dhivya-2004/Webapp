import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, receipt } = body;

    // Use dummy keys if environment variables are not set
    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummykey12345';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummysecret1234567890';

    if (key_id === 'rzp_test_dummykey12345') {
      // Return a mocked order if using dummy keys to prevent real API authentication failures
      return NextResponse.json({
        id: 'order_dummy_' + Math.random().toString(36).substring(7),
        amount: amount * 100,
        currency: 'INR',
        receipt,
        status: 'created',
      }, { status: 200 });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Error creating order' },
      { status: 500 }
    );
  }
}
