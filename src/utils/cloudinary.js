import cloudinary from "cloudinary";

export const cloudinaryUpload = async (filePath) => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder: "Files", 
    });
    return result;
  } catch (error) {
    throw new Error("Cloudinary upload failed: " + error.message);
  }
};

export const cloudinaryUploadFromBuffer = async (buffer) => {
  try {
    const result = await cloudinary.v2.uploader.upload_stream({ folder: "Photos" }, (error, result) => {
      if (error) throw new Error("Cloudinary upload failed: " + error.message);
      return result;
    }).end(buffer);
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

export const cloudinaryDeleteMultiple = async (publicIds) => {
  try {
    await cloudinary.v2.api.delete_resources(publicIds);
  } catch (error) {
    throw new Error("Cloudinary delete failed: " + error.message);
  }
};

export const cloudinaryDeleteByPrefix = async (prefix) => {
  try {
    await cloudinary.v2.api.delete_resources_by_prefix(prefix);
  } catch (error) {
    throw new Error("Cloudinary delete failed: " + error.message);
  }
};

export const cloudinaryDeleteByTag = async (tag) => {
  try {
    await cloudinary.v2.api.delete_resources_by_tag(tag);
  } catch (error) {
    throw new Error("Cloudinary delete failed: " + error.message);
  }
};

export const cloudinaryDeleteAll = async () => {
  try {
    await cloudinary.v2.api.delete_all_resources();
  } catch (error) {
    throw new Error("Cloudinary delete failed: " + error.message);
  }
};
export const uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    // Check if the file is a valid image
    if (!file.mimetype.startsWith('image/')) {
      return reject(new Error("Invalid image file"));
    }

    cloudinary.v2.uploader.upload(file.path, (error, result) => {
      if (error) {
        if (error.message.includes("Invalid image file")) {
          return reject(new Error("Cloudinary upload failed: The provided file is not a valid image."));
        }
        return reject(new Error("Cloudinary upload failed: " + error.message));
      }
      resolve(result);
    });
  });
};
