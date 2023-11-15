import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name, email, message } = data;

  const mailer: any = nodemailer;
  // Create a Nodemailer transporter with your email service provider's settings
  const transporter = mailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // use TLS
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Email content
  const mailOptions = {
    replyTo: email,
    from: 'temitopepinheiro@gmail.com',
    to: 'temitopepinheiro@gmail.com',
    subject: `New message from your portfolio from ${name}`,
    text: `Hi Temitope, ${message.toString()}`,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({
      statusCode: 200,
      body: { message: 'Message sent successfully' },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        statusCode: 500,
        body: { message: 'Failed to send message' },
      },
      { status: 500 }
    );
  }
}
