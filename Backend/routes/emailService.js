const { sendEmail } = require('your-email-service-library');

async function sendVerificationEmail(email, verificationToken) {
  const verificationLink = `https://your-app-domain.com/verify?token=${verificationToken}`;
  const subject = 'Verify your email address';
  const text = `Please click on the following link to verify your email address: ${verificationLink}`;
  
  // Use your email service library to send the email
  await sendEmail(email, subject, text);
}

module.exports = { sendVerificationEmail };