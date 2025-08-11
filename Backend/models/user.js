const mongoose = require('mongoose');
const {Schema} = mongoose

const userSchema = new Schema({
  username: { type: String, unique: true, index: true },
  email: { type: String, unique: true },
  password: String,
  emailNotifications: { type: Boolean, default: true },
});

const userModel = mongoose.model('User',userSchema);

module.exports = userModel;