// Modularized email handlers
const { sendWelcomeEmail } = require('./email/welcome');
const { sendProfileUpdateEmail } = require('./email/profileUpdate');
const { sendAccountDeletionEmail } = require('./email/accountDeletion');
const { sendPasswordResetEmail } = require('./email/passwordReset');

module.exports = {
  sendWelcomeEmail,
  sendProfileUpdateEmail,
  sendAccountDeletionEmail,
  sendPasswordResetEmail,
};
