import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, rejects) => {
    cloudinary.uploader
      .upload_stream((error, results) => {
        if (error) rejects(error);
        if (results) resolve(results.secure_url);
      })
      .end(buffer);
  });
}

export default cloudinary;
