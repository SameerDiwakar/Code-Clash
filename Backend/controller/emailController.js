require('dotenv').config();
const Mailgen = require("mailgen");
const nodemailer = require('nodemailer');

// Welcome email function for new users
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    let config = {
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    };
    let transporter = nodemailer.createTransport(config);
    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "WaranAI",
        link: "https://waran-ai.vercel.app",
      },
    });
    let response = {
      body: {
        name: userName || "Valued Customer",
        intro: "Welcome to WaranAI! 🎉",
        action: {
          instructions: "We're excited to have you on board. Get started by uploading your first warranty document.",
          button: {
            color: "#22BC66",
            text: "Go to Dashboard",
            link: "https://waran-ai.vercel.app/dashboard",
          },
        },
        table: {
          data: [
            { Feature: "Document Upload", Description: "Upload warranty documents and invoices" },
            { Feature: "AI Processing", Description: "Automatically extract warranty information" },
            { Feature: "Smart Reminders", Description: "Get notified before warranties expire" },
            { Feature: "Easy Management", Description: "Organize and track all your warranties" },
          ],
        },
        outro: "If you have any questions, feel free to reach out to our support team. Happy warranty managing!",
      },
    };
    let mail = MailGenerator.generate(response);
    let message = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: `Welcome to WaranAI, ${userName}! 🎉`,
      html: mail,
    };
    const info = await transporter.sendMail(message);
    // console.log("Welcome email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
};

// Profile update confirmation email function
const sendProfileUpdateEmail = async (userEmail, userName, updatedFields) => {
  try {
    let config = {
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    };
    let transporter = nodemailer.createTransport(config);
    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "WaranAI",
        link: "https://waran-ai.vercel.app",
      },
    });
    // Create a list of updated fields for the email
    const updatedFieldsList = Object.keys(updatedFields).map(field => {
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
      return `• ${fieldName}`;
    }).join('<br>');
    let response = {
      body: {
        name: userName || "Valued Customer",
        intro: "Your profile has been updated successfully! ✅",
        action: {
          instructions: "Your account information has been modified. Here's what was updated:",
          button: {
            color: "#22BC66",
            text: "View Profile",
            link: "https://waran-ai.vercel.app/settings",
          },
        },
        table: {
          data: [
            { "Updated Fields": "Changes Made", Details: updatedFieldsList || "Profile information updated" },
          ],
        },
        outro: "If you didn't make these changes, please contact our support team immediately. Your account security is important to us!",
      },
    };
    let mail = MailGenerator.generate(response);
    let message = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: `Profile Updated - WaranAI`,
      html: mail,
    };
    const info = await transporter.sendMail(message);
    // console.log("Profile update email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending profile update email:", error);
    return { success: false, error: error.message };
  }
};

// Account deletion confirmation email function
const sendAccountDeletionEmail = async (userEmail, userName) => {
  try {
    let config = {
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    };
    let transporter = nodemailer.createTransport(config);
    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "WaranAI",
        link: "https://waran-ai.vercel.app",
      },
    });
    let response = {
      body: {
        name: userName || "Valued Customer",
        intro: "Your WaranAI account has been deleted.",
        action: {
          instructions: "We're sorry to see you go. If this was a mistake or you have feedback, please let us know.",
          button: {
            color: "#22BC66",
            text: "Contact Support",
            link: "diwakarsameer27@gmail.com",
          },
        },
        outro: "Thank you for using WaranAI. If you change your mind, you're always welcome back!",
      },
    };
    let mail = MailGenerator.generate(response);
    let message = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: `Account Deleted - WaranAI`,
      html: mail,
    };
    const info = await transporter.sendMail(message);
    // console.log("Account deletion email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending account deletion email:", error);
    return { success: false, error: error.message };
  }
};

// Password reset email function
const sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
  try {
    let config = {
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    };
    let transporter = nodemailer.createTransport(config);
    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "WaranAI",
        link: "https://waran-ai.vercel.app",
      },
    });
    let response = {
      body: {
        name: userName || "Valued Customer",
        intro: "You requested a password reset for your WaranAI account.",
        action: {
          instructions: "Click the button below to reset your password. This link is valid for 10 minutes and can be used only once.",
          button: {
            color: "#22BC66",
            text: "Reset Password",
            link: resetUrl,
          },
        },
        outro: "If you did not request this, you can safely ignore this email. Your password will not be changed.",
      },
    };
    let mail = MailGenerator.generate(response);
    let message = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: `Reset your WaranAI password`,
      html: mail,
    };
    const info = await transporter.sendMail(message);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { 

  sendWelcomeEmail,
  sendProfileUpdateEmail,

  sendAccountDeletionEmail,
  sendPasswordResetEmail
}; 