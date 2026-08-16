import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { type, contact, otp } = await request.json();

    if (!type || !contact || !otp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'email') {
      // Send Email via Nodemailer
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"PhysioByHarish" <${process.env.SMTP_USER}>`,
        to: contact,
        subject: 'Your OTP for Registration',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #0ea5e9; text-align: center;">PhysioByHarish</h2>
            <p>Hello,</p>
            <p>Your One Time Password (OTP) for registration is:</p>
            <h1 style="text-align: center; color: #333; letter-spacing: 5px;">${otp}</h1>
            <p>This OTP is valid for a short time. Please do not share it with anyone.</p>
            <p>Best regards,<br/>The PhysioByHarish Team</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } 
    
    else if (type === 'phone') {
      // Send SMS via Fast2SMS
      const apiKey = process.env.FAST2SMS_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'Fast2SMS API key not configured' }, { status: 500 });
      }

      // Fast2SMS API requires numbers without the '+' sign or country code if sending within India, 
      // or ensure the country code is properly handled. We will strip non-digits.
      const cleanNumber = contact.replace(/\D/g, '').slice(-10); // get last 10 digits

      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: `Your OTP for registration is ${otp}`,
          flash: 0,
          numbers: cleanNumber
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.return) {
        console.error('Fast2SMS Error:', data);
        return NextResponse.json({ error: data.message || 'Failed to send SMS' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'SMS sent successfully' });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('OTP Send Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
