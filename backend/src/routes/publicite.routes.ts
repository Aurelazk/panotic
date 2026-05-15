import { Router, Request, Response } from 'express';

const router = Router();

router.get('/campaigns/me', (req: Request, res: Response) => {
  res.json([]);
});

export default router;
