const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(256),
  totpCode: z.string().regex(/^[0-9]{6}$/).optional(),
  turnstileToken: z.string().max(4000).optional(),
});

module.exports = { loginSchema };
