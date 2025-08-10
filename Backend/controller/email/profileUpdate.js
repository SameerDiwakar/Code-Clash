const { getTransporter, mailGenerator } = require('./config');

// 2. Profile Update Email
const sendProfileUpdateEmail = async (userEmail, userName, updatedFields) => {
  try {
    const transporter = getTransporter();
    const updatedList = Object.keys(updatedFields || {})
      .map((field) => `• ${field.charAt(0).toUpperCase() + field.slice(1)}`)
      .join('<br>');

    const emailBody = {
      body: {
        name: userName || 'Coder',
        intro: 'Your CodeClash profile was updated successfully.',
        action: {
          instructions: 'The following fields were updated:',
          button: {
            color: '#1D4ED8',
            text: 'View Profile',
            link: 'https://codeclash.dev/settings',
          },
        },
        table: {
          data: [
            { 'Updated Field(s)': 'Details', Change: updatedList || 'General info updated' },
          ],
        },
        outro: 'If this wasn’t you, contact support immediately.',
      },
    };

    const mail = mailGenerator.generate(emailBody);
    const message = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: 'Profile Updated - CodeClash',
      html: mail,
    };

    const info = await transporter.sendMail(message);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { sendProfileUpdateEmail };
