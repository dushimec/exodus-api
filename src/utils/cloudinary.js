import cloudinary from "cloudinary";

export const cloudinaryUpload = async (filePath) => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder: "products", 
    });
    return result;
  } catch (error) {
    throw new Error("Cloudinary upload failed: " + error.message);
  }
};

export const cloudinaryDelete = async (publicId) => {
  try {
    await cloudinary.v2.uploader.destroy(publicId);
  } catch (error) {
    throw new Error("Cloudinary delete failed: " + error.message);
  }
};
