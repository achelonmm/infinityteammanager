import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { signToken } from '../middleware/auth';

const router = Router();

// Hash is generated once at startup from ADMIN_PASSWORD_HASH env var,
// or falls back to bcrypt hash of a default password for development.
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ||
  bcrypt.hashSync('Nano2025', 10);

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = signToken();
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
