import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, userId, emailType } = await request.json();

    if (!name || !email || !userId || !emailType) {
      return NextResponse.json(
        { error: 'Name, email, userId, and emailType are required' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER || 'dummy_user',
        pass: process.env.SMTP_PASS || 'dummy_pass',
      },
    });

    let subject = '';
    let htmlContent = '';

    if (emailType === 'approved') {
      subject = 'Your Doctor Account has been Approved! - PhysioByHarish';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #16a34a;">Congratulations Dr. ${name}!</h2>
          <p style="color: #475569; line-height: 1.6;">
            Your account application has been reviewed and <strong>approved</strong> by the administrator.
          </p>
          <p style="color: #475569; line-height: 1.6;">
            You can now log in to the Doctor Portal to manage your patients, schedule appointments, and access clinical equipment.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://yourwebsite.com/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Log In to Portal
            </a>
          </div>
        </div>
      `;
    } else if (emailType === 'rejected') {
      subject = 'Update on your Doctor Application - PhysioByHarish';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #dc2626;">Application Update for Dr. ${name}</h2>
          <p style="color: #475569; line-height: 1.6;">
            Thank you for your interest in joining PhysioByHarish. Unfortunately, after reviewing your application, we are unable to approve your account at this time.
          </p>
          <p style="color: #475569; line-height: 1.6;">
            If you believe this is a mistake or wish to provide additional documentation, please reply to this email to contact support.
          </p>
        </div>
      `;
    } else {
       return NextResponse.json({ error: 'Invalid emailType' }, { status: 400 });
    }

    const mailOptions = {
      from: '"PhysioByHarish" <divyamsk21@gmail.com>',
      to: email,
      subject: subject,
      html: htmlContent,
    };

    // We simulate sending the email if credentials are dummy
    if ((transporter.options as any).host === 'smtp.ethereal.email' && !process.env.SMTP_USER) {
      console.log('--- SIMULATED EMAIL SENT ---');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
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
