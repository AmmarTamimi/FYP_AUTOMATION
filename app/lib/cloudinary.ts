// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary automatically reads from CLOUDINARY_URL environment variable
// No explicit config needed if CLOUDINARY_URL is set
cloudinary.config({
  secure: true,
});

export default cloudinary;