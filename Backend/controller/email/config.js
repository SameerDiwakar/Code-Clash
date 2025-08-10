require('dotenv').config();
const Mailgen = require('mailgen');
const nodemailer = require('nodemailer');

// Centralized Nodemailer transporter config
const transporterConfig = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
};

// Factory to get a transporter instance
const getTransporter = () => nodemailer.createTransport(transporterConfig);

// Shared Mailgen instance
const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'CodeClash',
    link: 'https://codeclash.dev', // Replace with actual domain
  },
});

module.exports = {
  transporterConfig,
  getTransporter,
  mailGenerator,
};
