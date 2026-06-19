"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.resendOtp = exports.getMe = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const signup = async (req, res) => {
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
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName: first,
                lastName: last,
                ...(phone ? { phone } : {}),
            },
        });
        const access_token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({ user: userWithoutPassword, access_token });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }
        const access_token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, access_token });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Non authentifié' });
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        include: { subscription: true }
    });
    if (!user)
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
};
exports.getMe = getMe;
const resendOtp = async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ error: 'Numéro de téléphone requis' });
    }
    console.log(`Resending OTP to phone ${phone}`);
    // In production, integrate with SMS provider (Twilio, etc.)
    res.json({ message: 'Code de vérification renvoyé avec succès' });
};
exports.resendOtp = resendOtp;
const verifyOtp = async (req, res) => {
    // Mock OTP verification
    const { code, phone } = req.body;
    console.log(`Verifying OTP ${code} for phone ${phone}`);
    // For demo, any 6-digit code works
    if (code && code.length >= 4) {
        // Find or create user by phone? 
        // For now, just return success if code is provided
        res.json({ message: 'OTP vérifié avec succès', token: 'mock_token_for_phone' });
    }
    else {
        res.status(400).json({ error: 'Code invalide' });
    }
};
exports.verifyOtp = verifyOtp;
