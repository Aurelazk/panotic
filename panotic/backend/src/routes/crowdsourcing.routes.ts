import { Router } from 'express';
import multer from 'multer';
import { submitBillboard } from '../controllers/crowdsourcingController';
import path from 'path';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Make sure the uploads directory exists or configure properly
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// POST /api/crowdsourcing/submit
router.post('/submit', upload.single('photo'), submitBillboard);

export default router;
