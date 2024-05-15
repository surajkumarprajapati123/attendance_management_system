const { UserModel, TokenModel } = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");
const NodeCache = require("node-cache");
const dotenv = require("dotenv");
const nodeCache = new NodeCache();
const jwt = require("jsonwebtoken");
const UploadfileOnCloudinary = require("../utils/cloudinary");
const deleteFileFromCloudinary = require("../utils/DeleteUserAvatar");
dotenv.config();

const UserUpdateWithIdService = async (adminid, userData) => {
  try {
    let user;

    // Extract email and password from userData
    const { email, password, username, name, avatar } = userData;

    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(email)) {
      throw new ErrorHandler("Invalid Email", 400);
    }
    // Check if email is provided in the userData
    if (password) {
      throw new ErrorHandler("Password can't be changed", 400);
    }
    if (avatar) {
      throw new ErrorHandler("Avatar you can't  change ", 400);
    }

    // If password is provided, hash it
    // if (password) {
    //   const hashedPassword = await bcrypt.hash(password, 10);
    //   updatedData.password = hashedPassword;
    // }
    // if (email) {
    //   user = await UserModel.findOneAndUpdate({ email });
    //   if (user) {
    //     user.email = email;
    //   } else {

    //   }
    // }

    // Find and update user by userId
    user = await UserModel.findByIdAndUpdate(adminid, userData, {
      new: true,
    });

    // Check if user exists
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }
    user.password = undefined;
    nodeCache.del("users");
    return user;
  } catch (error) {
    throw error;
  }
};

const FindAllUserExceptLoggedIn = async (loggedInUserId) => {
  let users;
  if (nodeCache.has("users")) {
    users = JSON.parse(nodeCache.get("users"));
  } else {
    users = await UserModel.find({ _id: { $ne: loggedInUserId } });
    nodeCache.set("users", JSON.stringify(users));
  }
  if (users.length === 0) {
    throw new ErrorHandler("No other users found", 400);
  }

  return users;
};

const deleteuser = async (userId) => {
  const user = await UserModel.findByIdAndDelete(userId);
  if (!user) {
    throw ErrorHandler("user not found", 400);
  }
  return user;
};
const getProfile = async (userid) => {
  const user = await UserModel.findById({ _id: userid });
  if (!user) {
    throw new ErrorHandler("User Not found", 400);
  }
  user.password = undefined;
  user.email = undefined;
  return user;
};
const changePassword = async (userid, userdata) => {
  const { oldPassword, newPassword } = userdata;
  if (!oldPassword || !newPassword) {
    throw new ErrorHandler("Old password and new password are required", 400);
  }
  if (!oldPassword) {
    throw new ErrorHandler("Enter the oldpassword", 400);
  }
  if (!newPassword) {
    throw new ErrorHandler("Enter the oldpassword", 400);
  }
  let user;
  user = await UserModel.findById({ _id: userid });
  if (!user) {
    throw new ErrorHandler("User is not found", 400);
  }

  const newoldpassword = await user.comparePassword(oldPassword);

  if (!newoldpassword) {
    throw new ErrorHandler("old password is not match", 400);
  }
  user.password = newPassword;
  user.save();

  return user;
};
const Logoutuser = async (userid) => {
  const user = await TokenModel.findByIdAndUpdate(
    userid,
    {
      $unset: {
        token: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  // console.log("log out user is ", user);
  if (!user) {
    throw new ErrorHandler("Login first", 401);
  }
  // console.log("user logout is ", user);
  return user;
};

const useridfindbytoken = async (userid) => {
  const user = await UserModel.findById(userid);

  if (!user) {
    throw new ErrorHandler("User is not found", 401);
  }
  if (user.role !== "admin") {
    throw new ErrorHandler("You are not authorised", 400);
  }
  const token = await TokenModel.findOne({ user: user._id });

  console.log("token of admin side", token);
  if (!token) {
    throw new ErrorHandler("User token is not found", 401);
  }
  // console.log("id token is ", token._id);
  return token._id;
};

const UpdatedAdminAvatar = async (req, userId) => {
  try {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
      throw new ErrorHandler("Avatar file is missing", 400);
    }

    const newAvatar = await UploadfileOnCloudinary(avatarLocalPath);

    if (!newAvatar.url) {
      throw new ApiError(400, "Error while uploading avatar");
    }

    // Get the user document and extract the previous avatar URL
    const user = await UserModel.findById(userId);
    console.log("user is updatng show ", user);
    const previousAvatarUrl = user.avatar;

    // Delete previous avatar image from Cloudinary
    if (previousAvatarUrl) {
      await deleteFileFromCloudinary(previousAvatarUrl);
    }

    // Update user document with new avatar URL
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { avatar: newAvatar.url } },
      { new: true }
    ).select("-password -email");

    console.log("Updated user:", updatedUser);

    return updatedUser;
  } catch (error) {
    console.error("Error updating avatar:", error);
    throw error;
  }
};

module.exports = {
  UserUpdateWithIdService,
  FindAllUserExceptLoggedIn,
  deleteuser,
  getProfile,
  changePassword,
  useridfindbytoken,
  Logoutuser,
  UpdatedAdminAvatar,
};
