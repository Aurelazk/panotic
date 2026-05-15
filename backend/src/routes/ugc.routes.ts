import { Router } from 'express';
import { createPost, getPosts, createComment } from '../controllers/ugc.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getPosts);
router.post('/', authenticateJWT, createPost);
router.post('/comments', authenticateJWT, createComment);

export default router;
