const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Road Rules" <${process.env.EMAIL_USER || 'noreply@roadrules.com'}>`,
      to,
      subject,
      html,
      attachments
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return null;
  }
};

const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to Road Rules Academy',
    html: `
      <h1>Welcome ${user.full_name}!</h1>
      <p>Thank you for joining Road Rules Academy.</p>
      <p>Start learning road signs, traffic rules, and prepare for your driving exam.</p>
      <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login">Login to your dashboard</a></p>
    `
  });
};

const sendCertificateEmail = async (user, certificate) => {
  return sendEmail({
    to: user.email,
    subject: 'Your Road Rules Certificate',
    html: `
      <h1>Congratulations ${user.full_name}!</h1>
      <p>You have earned your Road Rules Certificate.</p>
      <p>Certificate Number: <strong>${certificate.certificate_number}</strong></p>
      <p>You can download your certificate from your dashboard.</p>
    `,
    attachments: certificate.file_url ? [{
      path: certificate.file_url
    }] : []
  });
};

module.exports = { sendEmail, sendWelcomeEmail, sendCertificateEmail };
