// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// This function will be called to get a configured instance
export function getCloudinaryInstance() {
  // Configure with individual, hardcoded variables directly.
  // We know these are correct from your previous test.
  cloudinary.config({
    cloud_name: 'dvcihzupz',
    api_key: '713972188835876',
    api_secret: 'CxbUqONTuHT5AMbr5u8roYq5QIs',
    secure: true,
  });
  return cloudinary;
}