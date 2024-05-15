const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

const fs = require("fs");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_API_SCRET,
});

const UploadfileOnCloudinary = async (localpath) => {
  try {
    if (!localpath) return null;
    // upload file here
    const responce = await cloudinary.uploader.upload(localpath, {
      resouce_type: "image",
    });
    console.log("file is uploaded in cloudinary", responce.url);
    fs.unlinkSync(localpath);
    return responce;
  } catch (error) {
    fs.unlinkSync(localpath);
    console.log("error is ", error);
    return null;
  }
};

module.exports = UploadfileOnCloudinary;
