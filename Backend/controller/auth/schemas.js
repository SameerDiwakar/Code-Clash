const { z } = require('zod');

// Zod schemas for authentication
const registerSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[a-zA-Z]/, 'Password must include at least one letter')
    .regex(/[0-9]/, 'Password must include at least one number'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

module.exports = {
  registerSchema,
  loginSchema
};
