/*
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { TokenModel } = require("../models");
const { tokenTypes } = require("../config/tokens");
const { UserService } = require("../service");

const generateToken = (
  userId,
  expires,
  type,
  secret = process.env.SECRET_KEY
) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  const newToken = jwt.sign(payload, secret);
  console.log("token genereate", newToken);
  return jwt.sign(payload, secret);
};

const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await TokenModel.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  console.log("save token into databae", tokenDoc);
  return tokenDoc;
};

const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, process.env.SECRET_KEY);
  console.log("working 1", payload);
  const tokenDoc = await TokenModel.findOne({
    token,
    type,
    user: payload.sub,
    blacklisted: false,
  });
  console.log("up type is ", tokenDoc);

  if (!tokenDoc) {
    throw new Error("Token not found");
  }
  console.log("token type is ", tokenDoc);
  return tokenDoc;
};

// (async () => {
//   const data = verifyToken(
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjNjYTIwYmIxZDFmMjI0MWUyNDUyMzkiLCJpYXQiOjE3MTU0Mjk5OTcsImV4cCI6MTcxNTQyOTk5NywidHlwZSI6InJlZnJlc2gifQ.GQ8Ov2rwPXtahscQQCU3DMeH77vo6KJI9nHzK_VKg2g",
//     "refresh"
//   );
//   console.log(data);
// })();

const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(
    process.env.JWT_ACCESS_EXPIRATION_MINUTES,
    "minutes"
  );
  const accessToken = generateToken(
    user.id,
    accessTokenExpires,
    tokenTypes.ACCESS
  );
  console.log("access TOken ", accessToken);

  const refreshTokenExpires = moment().add(
    process.env.JWT_REFRESH_EXPIRATION_DAYS,
    "days"
  );
  const refreshToken = generateToken(
    user.id,
    refreshTokenExpires,
    tokenTypes.REFRESH
  );
  console.log("access TOken ", refreshToken);
  await saveToken(
    refreshToken,
    user.id,
    refreshTokenExpires,
    tokenTypes.REFRESH
  );

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

const generateResetPasswordToken = async (email) => {
  const user = await UserService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
  }
  const expires = moment().add(
    process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    "minutes"
  );
  const resetPasswordToken = generateToken(
    user.id,
    expires,
    tokenTypes.RESET_PASSWORD
  );
  await saveToken(
    resetPasswordToken,
    user.id,
    expires,
    tokenTypes.RESET_PASSWORD
  );
  return resetPasswordToken;
};

const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(
    process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    "minutes"
  );
  const verifyEmailToken = generateToken(
    user.id,
    expires,
    tokenTypes.VERIFY_EMAIL
  );
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};
module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
};
*/

const { UserModel, TokenModel } = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");
const GenerateAccesssTokenandRefreshToken = async (userid) => {
  try {
    const user = await UserModel.findById(userid);
    // console.log("user is ", user);
    if (!user) {
      throw new ErrorHandler("User not found", 401);
    }
    const AccessToken = await user.generateAccessToken();
    const RefreshToken = await user.generateRefreshToken();
    const saveToken = await TokenModel.create({
      token: RefreshToken,
      user: userid,
      expires: Date.now(),
    });
    // console.log("save token is ", saveToken);
    return { saveToken, AccessToken, RefreshToken };
  } catch (error) {
    console.log("Error is ", error);
  }
};

module.exports = {
  GenerateAccesssTokenandRefreshToken,
};
