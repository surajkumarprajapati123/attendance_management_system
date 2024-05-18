const { AdminService } = require("../service");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/CatchAsync");

const UpdateUserWithID = catchAsync(async (req, res) => {
  //   const user = await AdminService.UpdateUserWithId(req.params.id, req.body);
  const user = await AdminService.UserUpdateWithIdService(
    req.params.id,
    req.body
  );
  ApiResponse(res, 200, "Updated Successfull", user);
});

const FindAllUserByAdmin = catchAsync(async (req, res) => {
  const user = await AdminService.FindAllUserExceptLoggedIn(req.user._id);
  ApiResponse(res, 200, "All data fatched successfully", user);
});

const DeleteUserById = catchAsync(async (req, res) => {
  const user = await AdminService.deleteuser(req.params.id);
  ApiResponse(res, 200, "User deleted successfully", null);
});

const GetProfile = catchAsync(async (req, res) => {
  let user;

  user = await AdminService.getProfile(req.user._id);
  ApiResponse(res, 200, "User Profile is ", user);
});

const resetPassword = catchAsync(async (req, res) => {
  let user;
  user = await AdminService.changePassword(req.user._id, req.body);
  ApiResponse(res, 200, "Password reset successfully", undefined);
});

const LogoutUser = catchAsync(async (req, res) => {
  console.log(req.user);
  const tokenId = await AdminService.useridfindbytoken(req.user._id);
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

const UpdateAdminAvatar = catchAsync(async (req, res) => {
  const user = await AdminService.UpdatedAdminAvatar(req, req.user._id);
  ApiResponse(res, 200, "Profile image updated successfully", user);
});

const updateAdminLeaveApplication = catchAsync(async (req, res) => {
  const user = await AdminService.updateAdminLeaveApplication(
    req.user._id,
    req.body
  );
  ApiResponse(res, 200, "Application is updated successfully", user);
});

const ApplyLeaveApplication = catchAsync(async (req, res) => {
  const user = await AdminService.ApplyLeaveadmin(req.user._id, req.body);

  ApiResponse(res, 200, "Application Apply successfully", user);
});

module.exports = {
  UpdateUserWithID,
  FindAllUserByAdmin,
  DeleteUserById,
  GetProfile,
  resetPassword,
  LogoutUser,
  UpdateAdminAvatar,
  updateAdminLeaveApplication,
  ApplyLeaveApplication,
};
