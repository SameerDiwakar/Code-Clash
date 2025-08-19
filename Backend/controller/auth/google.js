require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');

const jwtSecret = process.env.JWT_SECRET || 'ndwsd93er932rh02';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/google
// Body: { idToken: string }
async function googleLogin(req, res) {
  const { idToken } = req.body || {};
  if (!idToken) return res.status(400).json({ message: 'Missing idToken' });

  try {
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ message: 'Invalid Google token' });

    const { sub: googleId, email, name } = payload;
    if (!email) return res.status(400).json({ message: 'Email not available from Google' });

    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
      // Create a new user linked to Google
      const randomPass = bcrypt.hashSync(`${googleId}.${Date.now()}`, 10);
      const usernameBase = (name || email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9_\-]/g, '');

      // Ensure unique username by appending numbers if needed
      let username = usernameBase || 'user';
      let suffix = 0;
      while (await User.findOne({ username })) {
        suffix += 1;
        username = `${usernameBase}${suffix}`;
      }

      user = await User.create({
        username,
        email,
        password: randomPass,
        googleId,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    jwt.sign(
      { email: user.email, id: user._id },
      jwtSecret,
      {},
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res
          .cookie('token', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 1000 * 60 * 60 * 24 * 30,
          })
          .json({ _id: user._id, email: user.email, username: user.username });
      }
    );
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(401).json({ message: 'Google authentication failed' });
  }
}

module.exports = { googleLogin };
