import { Router } from 'express';
import {
  getFormations,
  getFormationById,
  enrollInFormation,
} from '../controllers/formations.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getFormations);
router.get('/:id', authenticateJWT, getFormationById);
router.post('/:id/enroll', authenticateJWT, enrollInFormation);

export default router;
