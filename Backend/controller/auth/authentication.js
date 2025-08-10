require('dotenv').config();
const User = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../emailController');
const { registerSchema, loginSchema } = require('./schemas');

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET || 'ndwsd93er932rh02';

// Register route function
const register = async (req, res) => {
  const { username, email, password } = req.body;
  // Zod validation
  const result = registerSchema.safeParse({ username, email, password });
  if (!result.success) {
    return res.status(400).json({ message: result.error.errors[0]?.message || 'Invalid input' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const userDoc = await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    // Send welcome email (async, don't block response)
    sendWelcomeEmail(email, username).catch(e => console.error('Welcome email error:', e));
    
    // Return safe user data only (exclude password)
    res.json({
      _id: userDoc._id,
      username: userDoc.username,
      email: userDoc.email,
    });
  } catch (e) {
    console.error('Register error:', e);
    res.status(422).json({ message: 'Registration failed' });
  }
};

// Login route function
const login = async (req, res) => {
  const { email, password } = req.body;
  // Zod validation
  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return res.status(400).json({ message: result.error.errors[0]?.message || 'Invalid input' });
  }
  try {
    const userDoc = await User.findOne({ email });
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (!passOk) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    jwt.sign(
      { email: userDoc.email, id: userDoc._id },
      jwtSecret,
      {},
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.cookie('token', token, {
          httpOnly: true,
          sameSite: 'none', // allow cross-site cookies
          secure: true,     // only over HTTPS (adjust for dev accordingly)
          maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
        }).json({
          _id: userDoc._id,
          email: userDoc.email,
          username: userDoc.username,
        });
      }
    );
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Logout route function
const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  }).json(true);
};

module.exports = {
  register,
  login,
  logout
};
