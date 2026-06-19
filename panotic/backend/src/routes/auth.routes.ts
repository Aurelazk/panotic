import { Router } from 'express';
import { signup, login, getMe, verifyOtp, resendOtp } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get('/me', authenticateJWT, getMe);

export default router;
