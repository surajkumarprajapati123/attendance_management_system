const cloudinary = require("cloudinary").v2;

const deleteFileFromCloudinary = async (fileUrl) => {
  try {
    // Extract public ID from the file URL
    const publicId = extractPublicId(fileUrl);

    // If public ID is found, delete the file from Cloudinary
    if (publicId) {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log("Deleted file from Cloudinary:", result);
    } else {
      console.warn("Public ID not found in file URL:", fileUrl);
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw error;
  }
};

// Function to extract public ID from Cloudinary URL
const extractPublicId = (fileUrl) => {
  console.log("delete avatar image for user", fileUrl);
  const parts = fileUrl.split("/");
  const filename = parts.pop();
  const publicId = filename.split(".")[0];
  return publicId;
};

module.exports = deleteFileFromCloudinary;
