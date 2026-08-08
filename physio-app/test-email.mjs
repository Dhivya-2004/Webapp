import nodemailer from 'nodemailer';

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'divyamsk21@gmail.com',
      pass: 'veulvoyqymostazk',
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"PhysioByHarish" <divyamsk21@gmail.com>',
      to: 'divyamsk21@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email.',
    });
    console.log('Success:', info.messageId);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
}

testEmail();
