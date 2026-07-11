import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../services/db';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secret_access_token_key_123';

const otpStore = new Map<string, { code: string; expiresAt: number }>();

export const sendOtp = async (req: Request, res: Response) => {
  const { phone } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(phone, { code: otp, expiresAt });
    console.log(`[SMS] OTP to ${phone}: ${otp}`);

    await prisma.auditLog.create({
      data: { action: 'AUTH_OTP_SENT', details: `OTP generated for ${phone}` }
    });
    return res.status(200).json({ 
      success: true, 
      message: 'OTP sent',
      devOtp: otp // Included for seamless local testing
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  try {
    const record = otpStore.get(phone);
    if (!record || record.code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    otpStore.delete(phone);

    let user = await prisma.user.findUnique({ where: { phone }, include: { expert: true } });
    if (!user) {
      // Direct redirection to signup onboarding form
      return res.status(200).json({ success: true, onboardingRequired: true, phone });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_ACCESS_SECRET, { expiresIn: '7d' });
    
    await prisma.auditLog.create({
      data: { action: 'AUTH_LOGIN', userId: user.id, details: 'Login successful' }
    });
    return res.status(200).json({ success: true, token, user });
  } catch (error) {
    return res.status(500).json({ error: 'Login failed' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { phone, name, email, role, specialization, fees } = req.body;
  try {
    const validatedRole = role || 'CLIENT';
    if (!['CLIENT', 'ADMIN', 'EXPERT'].includes(validatedRole)) {
      return res.status(400).json({ error: 'Invalid role selected.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const user = await prisma.user.create({
      data: {
        phone,
        name,
        email: email || null,
        role: validatedRole,
        expert: validatedRole === 'EXPERT' ? {
          create: {
            specialization: specialization || 'General CA Consultant',
            fees: fees ? parseFloat(fees) : 1000,
            reviewsCount: 0,
            casesDone: 0
          }
        } : undefined
      },
      include: { expert: true }
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_ACCESS_SECRET, { expiresIn: '7d' });

    await prisma.auditLog.create({
      data: { action: 'AUTH_REGISTER', userId: user.id, details: `Registered user as ${validatedRole}` }
    });

    return res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error('Registration failed:', error);
    return res.status(500).json({ error: 'Registration failed.' });
  }
};


export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { expert: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const getExperts = async (_req: Request, res: Response) => {
  try {
    const experts = await prisma.expert.findMany({
      include: { user: true }
    });
    // Format to match what frontend expects
    const formattedExperts = experts.map(e => ({
      id: e.userId,
      name: e.user.name,
      photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256", // placeholder
      specialization: e.specialization,
      experience: "10 Years Exp", // placeholder if not in DB
      rating: e.user.rating || 4.5,
      reviews: e.reviewsCount,
      fees: e.fees
    }));
    return res.status(200).json({ success: true, data: formattedExperts });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch experts' });
  }
};
