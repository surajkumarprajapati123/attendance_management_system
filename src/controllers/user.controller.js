const { UserService, TokenService } = require("../service");
const ApiResponse = require("../utils/ApiResponse");
const { GeneratorOtp, SendMailWithTemplate } = require("../service/EmailSend");
const catchAsync = require("../utils/CatchAsync");
const {
  GenerateAccesssTokenandRefreshToken,
} = require("../service/token.service");

const RegisterUser = catchAsync(async (req, res) => {
  let user;

  user = await UserService.RegisterUser(req, req.body);
  if (user) {
    user.password = undefined;
  }

  const generateOtp = await GeneratorOtp(req.body.email);
  await SendMailWithTemplate(
    req.body.email,
    generateOtp.otp,
    req.body.username
  );

  // console.log("Token is ", generateOtp);

  ApiResponse(
    res,
    201,
    `User is created Successfully and otp send ${user.email}`,
    user
  );
});

const LoginUser = catchAsync(async (req, res) => {
  let user;

  user = await UserService.Login(req.body);

  // Ensure sensitive data is not sent back to the client
  user.password = undefined;
  user.email = undefined;
  // console.log(user);

  const { AccessToken, RefreshToken } =
    await GenerateAccesssTokenandRefreshToken(user._id);

  res
    .status(200)
    // Set cookies for AccessToken and RefreshToken
    .cookie("AccessToken", AccessToken)
    .cookie("RefreshToken", RefreshToken)
    .json({
      message: "User logged in successfully",
      success: true,
      tokens: {
        access: {
          AccessToken,
        },
        refresh: {
          RefreshToken,
        },
      },
    });
});

const FindallUser = catchAsync(async (req, res) => {
  const user = await UserService.findAlluser();
  ApiResponse(res, 200, "Fetching All user", user);
});

const ForgatePassword = catchAsync(async (req, res) => {
  let user;
  user = await UserService.ForgatePasswordService(req.body.email);

  ApiResponse(
    res,
    200,
    "The registered email address is included in the link, please verify it.",
    user
  );
});

const ResetPassword = catchAsync(async (req, res) => {
  let user;
  user = await UserService.resetPassword(req.body, req.params.token);
  user.password = undefined;
  ApiResponse(res, 200, "password is change successfully", null);
});

const GetProfile = catchAsync(async (req, res) => {
  let user;

  user = await UserService.getProfile(req.user._id);
  ApiResponse(res, 200, "User Profile is ", user);
});

const updateProfile = catchAsync(async (req, res) => {
  let user;
  user = await UserService.updateUser(req.user._id, req.body);
  ApiResponse(res, 200, "Profile Updated Successfull", user);
});

const UpdateAvater = catchAsync(async (req, res) => {
  let user;
  user = await UserService.updateAvatar(req, req.user._id);
  ApiResponse(res, 200, "Profile Updated Successfull", user);
});

const VerifyOtpUser = catchAsync(async (req, res) => {
  let user;
  user = await UserService.VerifyOtp(req.body);
  ApiResponse(res, 200, "Otp Verified successfully", null);
});

const ResetPassworItself = catchAsync(async (req, res) => {
  let user;
  user = await UserService.changePassword(req.user._id, req.body);
  ApiResponse(res, 200, "Password reset successfully", undefined);
});

const RefreshTokenController = catchAsync(async (req, res) => {
  const token = req.cookies.RefreshToken || req.body.RefreshToken;
  // console.log("token is ", token);
  const { AccessToken, RefreshToken } = await UserService.RefreshToken(token);
  // console.log("access token", AccessToken);
  // console.log("Refresh token", RefreshToken);
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", AccessToken, options)
    .cookie("refreshToken", RefreshToken, options)
    .json({
      message: "Access token refreshed",
      tokens: {
        accessToken: { AccessToken },
        newrefreshToken: { RefreshToken },
      },
    });
});

const LogoutUser = catchAsync(async (req, res) => {
  // console.log(req.user);
  const tokenId = await UserService.useridfindbytoken(req.user._id);
  await UserService.Logoutuser(tokenId);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("RefreshToken", options)
    .json({
      message: "User Logout successsfully",
    });
});

const FindAllDepartmentUser = catchAsync(async (req, res) => {
  const department = await UserService.findDepartmentAllUser(
    req.user._id,
    req.body
  );
  ApiResponse(res, 200, "User date fetched successfully", department);
});

module.exports = {
  FindAllDepartmentUser,
  RegisterUser,
  LoginUser,
  FindallUser,
  ForgatePassword,
  ResetPassword,
  GetProfile,
  updateProfile,
  VerifyOtpUser,
  ResetPassworItself,
  RefreshTokenController,
  LogoutUser,
  UpdateAvater,
};
