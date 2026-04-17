const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: `${process.env.EMAIL_USER}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  try {
      const info = await transporter.sendMail(message);
      console.log('Message sent: %s', info.messageId);
  } catch (error) {
      console.error('Error sending email', error);
  }
};

module.exports = sendEmail;
