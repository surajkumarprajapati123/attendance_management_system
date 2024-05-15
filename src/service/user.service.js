const { UserModel, OtpModel, TokenModel } = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const { SendOnlyEmailForgate } = require("./EmailSend");
const bcrypt = require("bcrypt");
const { GenerateAccesssTokenandRefreshToken } = require("./token.service");
const UploadfileOnCloudinary = require("../utils/cloudinary");
const deleteFileFromCloudinary = require("../utils/DeleteUserAvatar");

const RegisterUser = async (req, userdata) => {
  let user;

  const { name, email, username, password, role } = userdata;

  if (password.length == 0) {
    throw new ErrorHandler("Password must be between 3  to 8 character");
  }
  if (!name && !email && !username && !password) {
    throw new ErrorHandler("All fields are required", 401);
  } else if (!password) {
    throw new ErrorHandler("Password is required", 401);
  } else if (!name) {
    throw new ErrorHandler("Name is required", 401);
  } else if (!email) {
    throw new ErrorHandler("Email is required", 401);
  } else if (!username) {
    throw new ErrorHandler("usernname is required", 401);
  }

  if (password.length < 1 || password.length < 3 || password.length > 8) {
    throw new ErrorHandler("Password must be between 3 to 8 character");
  }
  if (role == "admin") {
    throw new ErrorHandler("You are not create to this role", 401);
  }
  user = await UserModel.findOne({ email });
  if (user) {
    throw new ErrorHandler("Already Register User", 401);
  }
  // console.log("req.file", req.file);
  const avatar = req.file?.path;
  // console.log("avatart", avatar);
  const avatarimage = await UploadfileOnCloudinary(avatar);
  // console.log("avatarimage is ", avatarimage);
  if (!avatar) {
    throw new ErrorHandler("Select the avatar/profile image", 401);
  }
  user = await UserModel.create({ ...userdata, avatar: avatarimage.url });
  // console.log("useris", user);

  return user;
};

const Login = async (userData) => {
  const { password, username, email } = userData;
  console.log("login password", password);
  console.log(" login type of password", typeof password);
  if (!email && !username) {
    throw new ErrorHandler("Enter email or username", 401);
  }
  if (!password) {
    throw new ErrorHandler("Password is required", 401);
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (email && !emailRegex.test(email)) {
    throw new ErrorHandler("Invalid Email", 401);
  }

  try {
    user = await UserModel.findOne({ $or: [{ username }, { email }] });

    if (!user) {
      throw new ErrorHandler("User is not registered", 401);
    }
    // console.log("user is login  secction", user);
    // Check if a password is required

    // Assuming user.comparePassword() is an asynchronous function
    const isCorrectPassword = await user.comparePassword(password);
    console.log(isCorrectPassword);
    if (!isCorrectPassword) {
      throw new ErrorHandler("Password is incorrect", 401);
    }

    if (!user.isVerified) {
      throw new ErrorHandler("First Verify the email", 401);
    }
    // console.log(" login user", user);
    return user;
  } catch (error) {
    throw new ErrorHandler(error.message);
  }
};

const findAlluser = async () => {
  const user = await UserModel.find({});
  if (!user) {
    throw new ErrorHandler("User name is not found", 401);
  }
  return user;
};

const ForgatePasswordService = async (email) => {
  if (!email) {
    throw new ErrorHandler("Enter the email ", 401);
  }
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!pattern.test(email)) {
    throw new ErrorHandler("Invalid Email", 401);
  }
  let data;
  data = await UserModel.findOne({ email });
  if (!data) {
    throw new ErrorHandler("User not found", 401);
  }
  const GenerateToken = jwt.sign({ _id: data._id }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
  console.log("GenerateToken", GenerateToken);
  data = await SendOnlyEmailForgate(email, GenerateToken);

  return data;
};

const resetPassword = async (passwordData, token) => {
  try {
    if (!token) {
      throw new ErrorHandler("Please Provide token", 401);
    }
    const { password } = passwordData;
    if (!password) {
      throw new ErrorHandler("Enter the Password", 401);
    }
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Reset password token", decodedToken);
    if (!decodedToken) {
      throw new ErrorHandler("Token is invalid", 401);
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Asynchronous hashing
    // console.log("Hashed password:", hashedPassword);

    const userId = decodedToken._id;
    const user = await UserModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    // console.log("User:", user);
    return user; // Return success message
  } catch (error) {
    // Handle errors
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ErrorHandler("Invalid token", 401);
    }
    throw error; // Re-throw other errors
  }
};

const getProfile = async (userid) => {
  const user = await UserModel.findById({ _id: userid }).select(
    "-password -_id"
  );
  if (user.role == "admin") {
    throw new ErrorHandler("You can't senn this profile", 401);
  }
  if (!user) {
    throw new ErrorHandler("User Not found", 401);
  }
  return user;
};

const updateUser = async (userId, userData) => {
  try {
    let user;

    // Extract email and password from userData
    const { email, password, name, username } = userData;

    // Check if email is provided in the userData
    if (email) {
      throw new ErrorHandler("Email can't be changed", 401);
    }
    if (password) {
      throw new ErrorHandler("Password can't be change", 401);
    }
    // If password is provided, hash it
    // if (password) {
    //   const hashedPassword = await bcrypt.hash(password, 10);
    //   updatedData.password = hashedPassword;
    // }

    // Find and update user by userId
    user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          username,
        },
      },
      {
        new: true,
      }
    );

    // Check if user exists
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }
    console.log("updated user  is", user);
    user.password = undefined;
    return user;
  } catch (error) {
    // If an error occurs, throw it for the calling function to handle
    throw error;
  }
};

const updateAvatar = async (req, userId) => {
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
    ).select("-password");

    console.log("Updated user:", updatedUser);

    return updatedUser;
  } catch (error) {
    console.error("Error updating avatar:", error);
    throw error;
  }
};

const VerifyOtp = async (userdata) => {
  const { otp } = userdata;
  if (!otp) {
    throw new ErrorHandler("Enter the otp", 401);
  }
  let user;
  user = await OtpModel.findOne({ otp: otp });
  if (!user) {
    throw new ErrorHandler("Invalid otp", 401);
  }
  user = await UserModel.findOne({ email: user.email });
  user.isVerified = true;
  user.save();
  return user;
};
const changePassword = async (userid, userdata) => {
  const { oldPassword, newPassword } = userdata;
  if (!oldPassword || !newPassword) {
    throw new ErrorHandler("Old password and new password are required", 401);
  }
  if (!oldPassword) {
    throw new ErrorHandler("Enter the oldpassword", 401);
  }
  if (!newPassword) {
    throw new ErrorHandler("Enter the oldpassword", 401);
  }
  let user;
  user = await UserModel.findById({ _id: userid });
  if (!user) {
    throw new ErrorHandler("User is not found", 401);
  }

  const newoldpassword = await user.comparePassword(oldPassword);

  if (!newoldpassword) {
    throw new ErrorHandler("old password is not match", 401);
  }
  user.password = newPassword;
  user.save();

  return user;
};

const getUserByEmail = async (userData) => {
  const { email } = userData;
  const user = await UserModel.findOne(email);
  if (!user) {
    throw new ErrorHandler("user is not found", 401);
  }
  return user;
};

const RefreshToken = async (priviousToken) => {
  if (!priviousToken) {
    throw new ErrorHandler("Unathorized request", 401);
  }
  try {
    const decodeToken = jwt.verify(
      priviousToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    // console.log("deocode Token", decodeToken);
    const tokenDocument = await TokenModel.findOne({ user: decodeToken._id });
    // console.log("token document form  user", tokenDocument);
    if (!tokenDocument || priviousToken !== tokenDocument.token) {
      throw new ErrorHandler("Invalid refresh token", 401);
    }
    if (priviousToken !== tokenDocument?.token) {
      throw new ErrorHandler("Refresh token is expired or used");
    }

    const { AccessToken, RefreshToken } =
      await GenerateAccesssTokenandRefreshToken(tokenDocument.user);

    return { AccessToken, RefreshToken };
  } catch (error) {
    console.log(error);
  }
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
  const token = await TokenModel.findOne({ user: user._id });
  if (!token) {
    throw new ErrorHandler("User token is not found", 401);
  }
  // console.log("id token is ", token._id);
  return token._id;
};

module.exports = {
  RegisterUser,
  Login,
  findAlluser,
  ForgatePasswordService,
  resetPassword,
  getProfile,
  updateUser,
  VerifyOtp,
  changePassword,
  getUserByEmail,
  RefreshToken,
  Logoutuser,
  useridfindbytoken,
  updateAvatar,
};
