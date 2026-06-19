import { Router } from 'express';
import { getPanels, getZones, searchMapping } from '../controllers/mapping.controller';

const router = Router();

router.get('/panels', getPanels);
router.get('/zones', getZones);
router.get('/search', searchMapping);

export default router;
