import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, firstName, lastName, phone } = req.body;

    // Accepte fullName (mobile) ou firstName+lastName (autres clients)
    let first = firstName;
    let last = lastName;
    if (fullName && !firstName) {
      const parts = fullName.trim().split(' ');
      first = parts[0] || fullName;
      last = parts.slice(1).join(' ') || '';
    }

    if (!email || !password || (!fullName && !firstName)) {
      return res.status(400).json({ error: 'Email, mot de passe et nom sont requis' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: first,
        lastName: last,
        ...(phone ? { phone } : {}),
      },
    });

    const access_token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword, access_token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const access_token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, access_token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.sendStatus(401);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true }
  });

  if (!user) return res.sendStatus(404);

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
};

export const verifyOtp = async (req: Request, res: Response) => {
  // Mock OTP verification
  const { code, phone } = req.body;
  console.log(`Verifying OTP ${code} for phone ${phone}`);
  
  // For demo, any 6-digit code works
  if (code && code.length >= 4) {
    // Find or create user by phone? 
    // For now, just return success if code is provided
    res.json({ message: 'OTP vérifié avec succès', token: 'mock_token_for_phone' });
  } else {
    res.status(400).json({ error: 'Code invalide' });
  }
};
