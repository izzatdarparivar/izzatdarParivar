"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Server action to upload a base64 image to Cloudinary.
 * This keeps the API Secret safe on the server.
 */
export async function uploadImageAction(base64Data: string) {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: "izzatdar_profiles",
      resource_type: "image",
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { fetch_format: "auto", quality: "auto" }
      ]
    });
    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return { success: false, error: "Upload failed" };
  }
}
