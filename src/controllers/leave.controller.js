const { LeaveService } = require("../service");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/CatchAsync");

const ApplyLeave = catchAsync(async (req, res) => {
  const leave = await LeaveService.ApplyLeave(req.user._id, req.body);
  ApiResponse(res, 201, "Leave Application is Create Successfully", leave);
});

const updateApplicationById = catchAsync(async (req, res) => {
  const leave = await LeaveService.updateApplicationByid(
    req.user._id,
    req.body
  );
  console.log("updated application for controller", leave);
  ApiResponse(res, 200, "Application is updated Successfully", leave);
});

// thisis
const UpdateApplicationByAllicaitonNumber = catchAsync(async (req, res) => {
  const leave = await LeaveService.updateApplicationByApplicationID(
    req.user._id,
    req.body,
    req.params.application_no
  );
  ApiResponse(res, 200, "Application is updated Successsfully", leave);
});

const GetAllPendingApplicationList = catchAsync(async (req, res) => {
  const leave = await LeaveService.getPendingAllApplicationList();
  ApiResponse(res, 200, "Application is fetching Sucessfully", leave);
});

const GetAllRejectApplicationList = catchAsync(async (req, res) => {
  const leave = await LeaveService.getrejectedAllApplicationList();
  ApiResponse(res, 200, "Application is fetching Successfully", leave);
});

const GetAllApprovedAppicationList = catchAsync(async (req, res) => {
  const leave = await LeaveService.getapprovedAllApplicationList();
  ApiResponse(res, 200, "Application is fetching Successfully", leave);
});

const SerchByApplicationNumber = catchAsync(async (req, res) => {
  const leave = await LeaveService.SearchbyApplicationNumber(
    req.query.application_no
  );
  ApiResponse(res, 200, "All data  is showing for this applicaiton ", leave);
});

const RejectAppliction = catchAsync(async (req, res) => {
  const leave = await LeaveService.RejectedLeave(req.params.id, req.body);
  ApiResponse(res, 200, "Apllication is Rejected Successfully", undefined);
});
const ApprovedAppliction = catchAsync(async (req, res) => {
  const leave = await LeaveService.ApprovedLeave(req.params.id, req.body);
  ApiResponse(res, 200, "Apllication is Approved  Successfully", undefined);
});

const ReApplicationApply = catchAsync(async (req, res) => {
  const data = LeaveService.ReapplyLeaveApplication(req.user._id, req.body);
  ApiResponse(res, 200, "Again Application Apply Successfully", data);
});

const Holidyas = catchAsync(async (req, res) => {
  const data = await LeaveService.HolidaysDays(req.query.year, req.query.month);
  ApiResponse(res, 200, "All Data Fetched Successfully", data);
});

const findLeaveDays = catchAsync(async (req, res) => {
  const data = await LeaveService.LeaveType();
  ApiResponse(res, 200, "Date Fetched successfully", data);
});

const findLeaveWithId = catchAsync(async (req, res) => {
  const data = await LeaveService.findLeaveTypeusingId(req.user._id);
  ApiResponse(res, 200, "Date Fetched successfully", data);
});

module.exports = {
  ApplyLeave,
  updateApplicationById,
  UpdateApplicationByAllicaitonNumber,
  GetAllPendingApplicationList,
  GetAllRejectApplicationList,
  GetAllApprovedAppicationList,
  SerchByApplicationNumber,
  RejectAppliction,
  ApprovedAppliction,
  ReApplicationApply,
  Holidyas,
  findLeaveDays,
  findLeaveWithId,
};
