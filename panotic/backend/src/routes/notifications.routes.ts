import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  // Mock notifications
  res.json([]);
});

router.get('/unread-count', (req: Request, res: Response) => {
  res.json({ count: 0 });
});

export default router;
