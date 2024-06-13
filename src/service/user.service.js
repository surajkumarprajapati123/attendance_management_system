const {
  UserModel,
  OtpModel,
  TokenModel,
  UserNameModel,
  LeaveTypeModel,
} = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const { SendOnlyEmailForgate } = require("./EmailSend");
const bcrypt = require("bcrypt");
const { GenerateAccesssTokenandRefreshToken } = require("./token.service");
const UploadfileOnCloudinary = require("../utils/cloudinary");
const deleteFileFromCloudinary = require("../utils/DeleteUserAvatar");
const randomString = require("randomstring");

const RegisterUser = async (req, userdata) => {
  // Destructure userdata to extract required fields
  const { name, email, username, password, role, departmentName } = userdata;

  // Check if all required fields are provided and not empty
  if (
    !name.trim() ||
    !email.trim() ||
    !username.trim() ||
    !password.trim() ||
    !departmentName.trim()
  ) {
    throw new ErrorHandler("All fields are required", 401);
  }

  // Check if email is in a valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ErrorHandler("Invalid email format", 401);
  }

  // Check if username and password contain spaces or underscores
  const invalidCharsRegex = /[\s_]/;
  if (invalidCharsRegex.test(username) || invalidCharsRegex.test(password)) {
    throw new ErrorHandler(
      "Username and password cannot contain spaces or underscores",
      401
    );
  }

  // Check password length
  if (password.length < 3 || password.length > 8) {
    throw new ErrorHandler("Password must be between 3 to 8 characters", 401);
  }

  // Check role
  if (role === "admin") {
    throw new ErrorHandler(
      "You are not allowed to create users with this role",
      401
    );
  }

  // Check if user already exists with the same email
  const existingUserWithEmail = await UserModel.findOne({ email });
  if (existingUserWithEmail) {
    throw new ErrorHandler("User with this email already exists", 401);
  }

  // Check if user already exists with the same username
  const existingUserWithUsername = await UserNameModel.findOne({ username });
  if (existingUserWithUsername) {
    throw new ErrorHandler("User with this username already exists", 401);
  }

  // Create new user
  const user = await UserModel.create(userdata);

  // Create a record in UserNameModel
  await UserNameModel.create({
    userid: user._id,
    username: username,
  });

  return user;
};

// const userData = {
//   name: "Charlie Brown",
//   email: "charlie.brown@yopmail.com",
//   password: "hashed", // Hashed password should be used
//   username: "charlieb23",
//   phone: "1234567890",
//   avatar: "https://example.com/avatar.jpg",
//   isVerified: true,
//   departmentName: "marketing",
// };

// RegisterUser("d", userData).then((resulte) => {
//   console.log("user is created ", resulte);
// });
const uploadAvatar = async (req) => {
  try {
    // Get the file path from the request object
    const avatarPath = req.file?.path;

    if (!avatarPath) {
      throw new Error("Avatar image file path not found");
    }

    // Upload the file to Cloudinary
    const avatarImage = await UploadfileOnCloudinary(avatarPath);

    if (!avatarImage || !avatarImage.url) {
      throw new Error("Failed to upload avatar to Cloudinary");
    }

    // Update the user record with the new avatar URL
    const user = await UserModel.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarImage.url },
      { new: true } // Option to return the updated document
    );

    if (!user) {
      throw new Error("Failed to update user record");
    }

    // console.log("Avatar updated successfully:", user);
    return user;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return { success: false, message: error.message };
  }
};

const Login = async (userData) => {
  const { password, username, email } = userData;
  // console.log("login password", password);
  // console.log(" login type of password", typeof password);
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
    // console.log(isCorrectPassword);
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
  // const dataa = randomString.generate({
  //   length: 100,
  //   charset: ["hex", 9],
  // });
  // console.log(dataa);
  if (!user) {
    throw new ErrorHandler("User name is not found", 401);
  }
  // console.log("all user is ", user);
  return user;
};
// findAlluser();

const ForgatePasswordService = async (email) => {
  if (!email) {
    throw new ErrorHandler("Enter the email ", 401);
  }
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!pattern.test(email)) {
    throw new ErrorHandler("Invalid Email", 401);
  }

  let user = await UserModel.findOne({ email });
  if (!user) {
    throw new ErrorHandler("User not found", 401);
  }

  // Check if user already has a reset token
  let tokenData = await TokenModel.findOne({
    user: user._id,
    tokenType: "Reset Token",
  });

  // Generate a new token
  const generateTokenRandom = randomString.generate({
    length: 100,
    charset: ["hex", 9],
  });
  const resetTokenExpiration = Date.now() + 10 * 60 * 1000;

  if (tokenData) {
    // If user already has a token, update it
    tokenData.token = generateTokenRandom;
    tokenData.expires = resetTokenExpiration;
    tokenData.blacklisted = false;
    await tokenData.save();
  } else {
    // If user does not have a token, create a new one
    await TokenModel.create({
      token: generateTokenRandom,
      user: user._id,
      expires: resetTokenExpiration,
      tokenType: "Reset Token",
    });
  }

  // console.log("GenerateToken", generateTokenRandom);

  // Send email with the reset token
  await SendOnlyEmailForgate(email, generateTokenRandom);

  return { message: "Reset token generated and sent successfully" };
};

// ForgatePasswordService("surajkumar@yopmail.com");

const resetPassword = async (passwordData, token) => {
  try {
    // Check if token is provided
    if (!token) {
      throw new ErrorHandler("Please provide a token", 401);
    }

    // Extract password from passwordData
    const { password } = passwordData;
    if (!password) {
      throw new ErrorHandler("Enter the Password", 401);
    }

    // Find token in database
    const decodedToken = await TokenModel.findOne({ token });
    if (!decodedToken) {
      throw new ErrorHandler("Token is invalid", 401);
    }

    // Log current time and decoded token time
    // console.log("Current time: ", new Date());
    // console.log("Token expiry time: ", new Date(decodedToken.expires));

    // Check if token has expired
    if (Date.now() > decodedToken.expires) {
      decodedToken.blacklisted = true;
      await decodedToken.save();
      throw new ErrorHandler(
        "Token has expired, please request a new one",
        401
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    const userId = decodedToken.user;
    const user = await UserModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    // Check if user exists
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    // Return the updated user
    return user;
  } catch (error) {
    // Handle errors
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ErrorHandler("Invalid token", 401);
    }
    throw error; // Re-throw other errors
  }
};

// const passwordData = {
//   password: "Surajkuamr",
// };
// resetPassword(passwordData, "r5O0cavvEDLAYglkx24UxdObyV6YRY0W");
const getProfile = async (userid) => {
  const user = await UserModel.findById({ _id: userid }).select(
    "-password -_id -__v"
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
    const { email, password, name, username, role, departmentName } = userData;

    // Check if email is provided in the userData
    if (email) {
      throw new ErrorHandler("Email can't be changed", 401);
    }
    if (password) {
      throw new ErrorHandler("Password can't be change", 401);
    }

    if (role) {
      throw new ErrorHandler("role can't be changed", 401);
    }
    // If password is provided, hash it
    // if (password) {
    //   const hashedPassword = await bcrypt.hash(password, 10);
    //   updatedData.password = hashedPassword;
    // }

    // Find and update user by userId
    const AllUSer = await UserNameModel.find({ username: username });
    if (!AllUSer) {
      throw new ErrorHandler("User is not found for this username", 401);
    }
    // console.log("This is a all user", AllUSer);
    if (AllUSer.find((user) => user.username === username)) {
      throw new ErrorHandler(
        "Thise username is already use other user try other",
        401
      );
    }
    const updatedUserName = await UserNameModel.findOneAndUpdate(
      { userid: userId },
      { $set: { username } },
      { new: true, upsert: true }
    );
    // console.log("NewUser", updatedUserName);
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
    return user;
  } catch (error) {
    // If an error occurs, throw it for the calling function to handle
    throw error;
  }
};
// const somedata = {
//   name: "updated Akashkumar",
//   username: "Akash04",
// };

// updateUser("66482adfe6e69f140a372dc6", somedata);
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
    // console.log("user is updatng show ", user);
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

    // console.log("Updated user:", updatedUser);

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
  // here a create a LeaveTypeModle
  await LeaveTypeModel.create({
    user: user._id,
  });
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

const findDepartmentAllUser = async (UserId, userdate) => {
  const { departmentName } = userdate;

  // Check if departmentName is provided
  if (!departmentName) {
    throw new ErrorHandler("Please select the department", 401);
  }

  try {
    // Find all users with the specified departmentName, excluding the specified UserId
    const users = await UserModel.find({
      _id: { $ne: UserId },
      departmentName: departmentName,
    });

    // console.log(
    //   "All users in the department (excluding specified user):",
    //   users
    // );
    return users;
  } catch (error) {
    console.error("Error finding users:", error);
    throw error;
  }
};

const userdate2 = {
  departmentName: "sales",
};
// findDepartmentAllUser("66614c435408c08b28c666e4", userdate2);
module.exports = {
  findDepartmentAllUser,
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
  uploadAvatar,
};
