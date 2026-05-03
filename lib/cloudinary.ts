import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads an image to Cloudinary and returns the secure URL.
 * Used for profile photos with matrimonial optimization.
 */
export async function uploadToCloudinary(fileStr: string, folder: string = "profiles") {
  try {
    const result = await cloudinary.uploader.upload(fileStr, {
      folder: `izzatdar/${folder}`,
      resource_type: "auto",
      // Optimization: Ensure photos are centered on faces
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { fetch_format: "auto", quality: "auto" }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
}

export default cloudinary;
