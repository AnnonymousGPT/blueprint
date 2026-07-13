import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../services/db';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secret_access_token_key_123';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_token_key_987';

const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

export const sendOtp = async (req: Request, res: Response) => {
  const { phone } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(phone, { code: otp, expiresAt, attempts: 0 });
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
    if (!record) {
      return res.status(400).json({ error: 'OTP expired or not requested.' });
    }

    // OTP Brute Force Protection: Limit verification attempts to 3
    if (record.attempts >= 3) {
      otpStore.delete(phone);
      return res.status(400).json({ error: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    }

    if (record.code !== otp) {
      record.attempts += 1;
      otpStore.set(phone, record);
      return res.status(400).json({ error: `Invalid OTP. ${3 - record.attempts} attempts remaining.` });
    }
    
    otpStore.delete(phone);

    let user = await prisma.user.findUnique({ where: { phone }, include: { expertProfile: true } as any });
    if (!user) {
      // Direct redirection to signup onboarding form
      return res.status(200).json({ success: true, onboardingRequired: true, phone });
    }

    const jwtRole = user.role === 'USER' ? 'CLIENT' : user.role;
    // Separate Access/Refresh Secrets
    const token = jwt.sign({ id: user.id, role: jwtRole, phone: user.phone }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id, role: jwtRole, phone: user.phone }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    
    // Save session to database
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.auditLog.create({
      data: { action: 'AUTH_LOGIN', userId: user.id, details: 'Login successful' }
    });
    return res.status(200).json({ success: true, token, refreshToken, user });
  } catch (error) {
    return res.status(500).json({ error: 'Login failed' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { phone, name, email, role, specialization, fees, experience } = req.body;
  try {
    const validatedRole = role || 'CLIENT';
    const dbRole = validatedRole === 'CLIENT' ? 'USER' : validatedRole;
    if (!['USER', 'ADMIN', 'EXPERT'].includes(dbRole)) {
      return res.status(400).json({ error: 'Invalid role selected.' });
    }

    // Upsert: if user already exists (by phone or email), return them with a fresh token
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
      include: { expertProfile: true } as any
    });
    if (existingUser) {
      const jwtRole = existingUser.role === 'USER' ? 'CLIENT' : existingUser.role;
      const token = jwt.sign({ id: existingUser.id, role: jwtRole, phone: existingUser.phone }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: existingUser.id, role: jwtRole, phone: existingUser.phone }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
      
      await prisma.session.create({
        data: {
          userId: existingUser.id,
          refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      return res.status(200).json({ success: true, token, refreshToken, user: existingUser });
    }

    const user = await prisma.user.create({
      data: {
        phone,
        name,
        email: email || null,
        role: dbRole as any,
        expertProfile: dbRole === 'EXPERT' ? {
          create: {
            specialization: specialization || 'General CA Consultant',
            experience: experience || '5 Years Exp',
            fees: fees ? parseFloat(fees) : 1000,
            reviewsCount: 0,
            rating: 5.0
          }
        } : undefined
      },
      include: { expertProfile: true } as any
    });

    const jwtRole = user.role === 'USER' ? 'CLIENT' : user.role;
    const token = jwt.sign({ id: user.id, role: jwtRole, phone: user.phone }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id, role: jwtRole, phone: user.phone }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.auditLog.create({
      data: { action: 'AUTH_REGISTER', userId: user.id, details: `Registered user as ${validatedRole}` }
    });

    return res.status(201).json({ success: true, token, refreshToken, user });
  } catch (error) {
    console.error('Registration failed:', error);
    return res.status(500).json({ error: 'Registration failed.' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required.' });
  }
  try {
    // Validate refresh token exists in DB and is active
    const session = await prisma.session.findUnique({
      where: { refreshToken }
    });
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Session expired or invalid refresh token.' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    const token = jwt.sign({ id: decoded.id, role: decoded.role, phone: decoded.phone }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
    return res.status(200).json({ success: true, token });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  const { refreshToken } = req.body;
  try {
    if (refreshToken) {
      await prisma.session.deleteMany({
        where: { refreshToken }
      });
    }
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'AUTH_LOGOUT',
          details: 'User logged out successfully'
        }
      });
    }
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Logout failed.' });
  }
};


export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { expertProfile: true } as any
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
      rating: (e.user as any).rating || 4.5,
      reviews: e.reviewsCount,
      fees: e.fees
    }));
    return res.status(200).json({ success: true, data: formattedExperts });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch experts' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, email, pan, gst } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        pan,
        gst
      }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'USER_PROFILE_UPDATED',
        details: `Updated profile details. Name: ${name}, Email: ${email}`
      }
    });

    return res.status(200).json({ success: true, user });
  } catch (error: any) {
    console.error('Profile update error:', error?.message);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Log the audit event first before cascade deletes clean up relations
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'USER_ACCOUNT_DELETED',
        details: `User requested complete account deletion.`
      }
    });

    // CASCADE delete relations
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.document.deleteMany({ where: { userId } });
    await prisma.serviceRequest.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    return res.status(200).json({ success: true, message: 'Account and associated data deleted successfully.' });
  } catch (error: any) {
    console.error('Account deletion error:', error?.message);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
};
