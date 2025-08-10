const { getTransporter, mailGenerator } = require('./config');

// 3. Account Deletion Email
const sendAccountDeletionEmail = async (userEmail, userName) => {
  try {
    const transporter = getTransporter();

    const emailBody = {
      body: {
        name: userName || 'Coder',
        intro: 'Your CodeClash account has been deleted.',
        action: {
          instructions:
            'We\'re sorry to see you go. If this was accidental or you have feedback, let us know.',
          button: {
            color: '#EF4444',
            text: 'Contact Support',
            link: 'mailto:support@codeclash.dev',
          },
        },
        outro: "Thank you for being part of CodeClash. You're always welcome back!",
      },
    };

    const mail = mailGenerator.generate(emailBody);
    const message = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: 'Account Deleted - CodeClash',
      html: mail,
    };

    const info = await transporter.sendMail(message);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { sendAccountDeletionEmail };
