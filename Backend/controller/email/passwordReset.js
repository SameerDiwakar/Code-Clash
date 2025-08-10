const { getTransporter, mailGenerator } = require('./config');

// 4. Password Reset Email
const sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
  try {
    const transporter = getTransporter();

    const emailBody = {
      body: {
        name: userName || 'Coder',
        intro: 'Password reset requested for your CodeClash account.',
        action: {
          instructions:
            'Click below to reset your password. This link is valid for 10 minutes:',
          button: {
            color: '#1D4ED8',
            text: 'Reset Password',
            link: resetUrl,
          },
        },
        outro: 'Didn’t request this? You can safely ignore this email.',
      },
    };

    const mail = mailGenerator.generate(emailBody);
    const message = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: 'Reset Your CodeClash Password',
      html: mail,
    };

    const info = await transporter.sendMail(message);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { sendPasswordResetEmail };
