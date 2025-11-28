import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';

// Local disk storage; swap with S3 adapter (e.g., @aws-sdk/client-s3) in production.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = env.uploadDir;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const upload = multer({ storage });

