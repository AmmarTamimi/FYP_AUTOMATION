// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with explicit values
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dvcihuzpz',
  api_key: process.env.CLOUDINARY_API_KEY || '713972188835876',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'CxbUqONTuHT5AMbr5u8roYq5QIs',
  secure: true,
});

export default cloudinary;