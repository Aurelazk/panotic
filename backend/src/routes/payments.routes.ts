import { Router, Request, Response } from 'express';

const router = Router();

router.get('/subscription', (req: Request, res: Response) => {
  res.json({ plan: 'FREE', status: 'ACTIVE' });
});

export default router;
