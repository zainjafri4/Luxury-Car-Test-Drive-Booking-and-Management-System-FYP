import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import { BadRequestError } from '../lib/errors.js';

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `vehicle-${uniqueSuffix}${ext}`);
  },
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadVehicleImages = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max per file (§8.4)
    files: 8, // up to 8 images per vehicle
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only JPEG, PNG and WebP images are allowed'));
    }
  },
});
