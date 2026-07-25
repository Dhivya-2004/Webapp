import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, userId } = await request.json();

    if (!name || !email || !userId) {
      return NextResponse.json(
        { error: 'Name, email, and userId are required' },
        { status: 400 }
      );
    }

    // This is a dummy SMTP transport setup. In a real application, 
    // you would configure this with your actual SMTP server details 
    // (e.g., Gmail App Passwords, SendGrid, Amazon SES).
    // For local testing, we are logging the form URL.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || 'dummy_user',
        pass: process.env.SMTP_PASS || 'dummy_pass',
      },
    });

    const formUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/doctor-onboarding?userId=${userId}`;

    const mailOptions = {
      from: '"PhysioByHarish" <noreply@physiobyharish.com>',
      to: email,
      subject: 'Complete Your Doctor Registration - PhysioByHarish',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #2563eb;">Welcome to PhysioByHarish, Dr. ${name}!</h2>
          <p style="color: #475569; line-height: 1.6;">
            Thank you for registering with us. To complete your doctor profile and gain full access to the platform, we need a few more details about your educational background.
          </p>
          <p style="color: #475569; line-height: 1.6;">
            Please click the button below to fill out your qualification details:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${formUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Complete Registration Form
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 20px;">
            If the button doesn't work, copy and paste this link into your browser: <br/>
            <a href="${formUrl}" style="color: #2563eb;">${formUrl}</a>
          </p>
        </div>
      `,
    };

    // We simulate sending the email if credentials are dummy
    if (transporter.options.host === 'smtp.ethereal.email' && !process.env.SMTP_USER) {
      console.log('--- SIMULATED EMAIL SENT ---');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Link: ${formUrl}`);
      console.log('----------------------------');
      
      return NextResponse.json({ success: true, message: 'Simulated email sent successfully' });
    }

    // Try to actually send if they provided real env vars
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: 'Email sent successfully' });
    
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
