require('dotenv').config();
const Mailgen = require("mailgen");
const nodemailer = require('nodemailer');

const transporterConfig = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
};

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "CodeClash",
    link: "https://codeclash.dev", // Replace with actual domain
  },
});

// 1. Welcome Email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = nodemailer.createTransport(transporterConfig);

    const emailBody = {
      body: {
        name: userName || "Coder",
        intro: "Welcome to CodeClash! 🔥",
        action: {
          instructions: "Start your first battle or set up your profile:",
          button: {
            color: "#1D4ED8",
            text: "Go to Dashboard",
            link: "https://codeclash.dev/dashboard",
          },
        },
        table: {
          data: [
            { Feature: "Battle Arena", Description: "Join coding battles in real-time" },
            { Feature: "Profile Showcase", Description: "Highlight your skills & GitHub" },
            { Feature: "Challenge Requests", Description: "Receive & manage coding challenges" },
            { Feature: "Live Code Execution", Description: "Compete with instant results" },
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

// 2. Profile Update Email
const sendProfileUpdateEmail = async (userEmail, userName, updatedFields) => {
  try {
    const transporter = nodemailer.createTransport(transporterConfig);
    const updatedList = Object.keys(updatedFields)
      .map(field => `• ${field.charAt(0).toUpperCase() + field.slice(1)}`)
      .join("<br>");

    const emailBody = {
      body: {
        name: userName || "Coder",
        intro: "Your CodeClash profile was updated successfully.",
        action: {
          instructions: "The following fields were updated:",
          button: {
            color: "#1D4ED8",
            text: "View Profile",
            link: "https://codeclash.dev/settings",
          },
        },
        table: {
          data: [
            { "Updated Field(s)": "Details", Change: updatedList || "General info updated" },
          ],
        },
        outro: "If this wasn’t you, contact support immediately.",
      },
    };

    const mail = mailGenerator.generate(emailBody);
    const message = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: `Profile Updated - CodeClash`,
      html: mail,
    };

    const info = await transporter.sendMail(message);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 3. Account Deletion Email
const sendAccountDeletionEmail = async (userEmail, userName) => {
  try {
    const transporter = nodemailer.createTransport(transporterConfig);

    const emailBody = {
      body: {
        name: userName || "Coder",
        intro: "Your CodeClash account has been deleted.",
        action: {
          instructions: "We're sorry to see you go. If this was accidental or you have feedback, let us know.",
          button: {
            color: "#EF4444",
            text: "Contact Support",
            link: "mailto:support@codeclash.dev",
          },
        },
        outro: "Thank you for being part of CodeClash. You're always welcome back!",
      },
    };

    const mail = mailGenerator.generate(emailBody);
    const message = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: `Account Deleted - CodeClash`,
      html: mail,
    };

    const info = await transporter.sendMail(message);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 4. Password Reset Email
const sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
  try {
    const transporter = nodemailer.createTransport(transporterConfig);

    const emailBody = {
      body: {
        name: userName || "Coder",
        intro: "Password reset requested for your CodeClash account.",
        action: {
          instructions: "Click below to reset your password. This link is valid for 10 minutes:",
          button: {
            color: "#1D4ED8",
            text: "Reset Password",
            link: resetUrl,
          },
        },
        outro: "Didn’t request this? You can safely ignore this email.",
      },
    };

    const mail = mailGenerator.generate(emailBody);
    const message = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: `Reset Your CodeClash Password`,
      html: mail,
    };

    const info = await transporter.sendMail(message);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendProfileUpdateEmail,
  sendAccountDeletionEmail,
  sendPasswordResetEmail,
};
