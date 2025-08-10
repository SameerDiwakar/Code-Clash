const { getTransporter, mailGenerator } = require('./config');

// 1. Welcome Email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = getTransporter();

    const emailBody = {
      body: {
        name: userName || 'Coder',
        intro: 'Welcome to CodeClash! 🔥',
        action: {
          instructions: 'Start your first battle or set up your profile:',
          button: {
            color: '#1D4ED8',
            text: 'Go to Dashboard',
            link: 'https://codeclash.dev/dashboard',
          },
        },
        table: {
          data: [
            { Feature: 'Battle Arena', Description: 'Join coding battles in real-time' },
            { Feature: 'Profile Showcase', Description: 'Highlight your skills & GitHub' },
            { Feature: 'Challenge Requests', Description: 'Receive & manage coding challenges' },
            { Feature: 'Live Code Execution', Description: 'Compete with instant results' },
          ],
        },
        outro: "Have questions? Reach out to our team. Let's clash with code!",
      },
    };

    const mail = mailGenerator.generate(emailBody);
    const message = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: `Welcome to CodeClash, ${userName}! 🚀`,
      html: mail,
    };

    const info = await transporter.sendMail(message);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { sendWelcomeEmail };
