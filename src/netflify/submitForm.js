import nodemailer from 'nodemailer';

exports.handler = async (event) => {
  const data = await event.json();
  const { name, email, message } = JSON.parse(data);

  // Create a Nodemailer transporter with your email service provider's settings
  const transporter = nodemailer.createTransport({
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
    from: email,
    to: 'temitopepinheiro@gmail.com',
    subject: 'New message from your portfolio!',
    text: `From: ${name}\nEmail: ${email}\nMessage: ${message.toString()}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to send message' }),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Message sent successfully' }),
      };
    }
  });
};
