import { Router } from 'express';
import {
  createSignalement,
  getSignalements,
  getSignalementById,
  voteSignalement,
} from '../controllers/signalements.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getSignalements);
router.get('/:id', getSignalementById);
router.post('/', authenticateJWT, createSignalement);
router.post('/:id/vote', authenticateJWT, voteSignalement);

export default router;
