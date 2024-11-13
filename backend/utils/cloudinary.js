import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dpoubtjwb",
  api_key: "164316761552663",
  api_secret: "DKjXZMDwWelQP1F0GLMn8tXfs_I",
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const transformation = {
      quality: "auto:low",
    };

    let res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
      transformation: transformation,
    });

    return res;
  } catch (err) {
    console.error("Error uploading to Cloudinary:", err);
    return null;
  } finally {
    // Check if the file exists before attempting to unlink it
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    }
  }
};
