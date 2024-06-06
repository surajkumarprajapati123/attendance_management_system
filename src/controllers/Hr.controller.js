const { AdminService, HrService } = require("../service");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/CatchAsync");

const UpdateUserWithID = catchAsync(async (req, res) => {
  //   const user = await AdminService.UpdateUserWithId(req.params.id, req.body);
  const user = await HrService.HrUpdateWithIdService(req.user._id, req.body);
  ApiResponse(res, 200, "Updated Successfull", user);
});

const GetProfile = catchAsync(async (req, res) => {
  let user;

  user = await HrService.getProfile(req.user._id);
  ApiResponse(res, 200, "User Profile is ", user);
});

const resetPassword = catchAsync(async (req, res) => {
  let user;
  user = await HrService.changePassword(req.user._id, req.body);
  ApiResponse(res, 200, "Password reset successfully", undefined);
});

const LogoutUser = catchAsync(async (req, res) => {
  // console.log(req.user);
  const tokenId = await HrService.Logoutuser(req.user._id);
  await AdminService.Logoutuser(tokenId);

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

const UpdateHrAvatar = catchAsync(async (req, res) => {
  const user = await HrService.UpdatedHrAvatar(req, req.user._id);
  ApiResponse(res, 200, "Profile image updated successfully", user);
});

const ApplyleaveApplictionByHR = catchAsync(async (req, res) => {
  const user = await HrService.ApplyLeaveHr(req.user._id, req.body);
  ApiResponse(res, 200, "Application Send successfully", user);
});

const SearchbyApplicationNumber = catchAsync(async (req, res) => {
  const user = await HrService.SearchbyApplicationNumber(
    req.query.application_no
  );
  ApiResponse(res, 200, "Application fetched successfully", user);
});

const updateLeaveApplication = catchAsync(async (req, res) => {
  const user = await HrService.updateLeaveApplication(req.user._id, req.body);
  ApiResponse(res, 200, "Application Updated successfully", user);
});
module.exports = {
  UpdateUserWithID,
  UpdateHrAvatar,
  updateLeaveApplication,
  GetProfile,
  resetPassword,
  LogoutUser,
  SearchbyApplicationNumber,
  ApplyleaveApplictionByHR,
};
