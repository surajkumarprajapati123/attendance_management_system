const { AttendanceService } = require("../service");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/CatchAsync");
const TakingAttendance = catchAsync(async (req, res) => {
  const attendance = await AttendanceService.TakeAttendance(
    req.user._id,
    req.body
  );
  ApiResponse(res, 201, "Attendance Taking successfully", attendance);
});

const FindAttendaceByMonth = catchAsync(async (req, res) => {
  const attendance = await AttendanceService.FindAttendaceByMonth(req.user._id);
  ApiResponse(res, 200, "Date fetched successfully", attendance);
});

const FindAttendaceByMonthName = catchAsync(async (req, res) => {
  const attendance = await AttendanceService.findAttendanceByMonthName(
    req.user._id,
    req.params.monthName
  );
  ApiResponse(res, 200, "Date fetched successfully", attendance);
});

const OutTimeAttendance = catchAsync(async (req, res) => {
  console.log("user id is", req.user);
  const attendance = await AttendanceService.OutTimeAttendance(req.user._id);
  ApiResponse(res, 200, "Data fetched successfully", attendance);
});

const FindOutOfAllAttendanceByMonth = catchAsync(async (req, res) => {
  const attendance = await AttendanceService.FindOutTimeAttendaceByMonth();
  ApiResponse(res, 200, "Date Fetched successfully", attendance);
});

const FindOutOfAllAttendanceByMonthName = catchAsync(async (req, res) => {
  const attendance = await AttendanceService.FindOutTimeAttendaceByMonthName(
    req.params.monthName
  );
  ApiResponse(res, 200, "Date Fetched successfully", attendance);
});

module.exports = {
  TakingAttendance,
  FindAttendaceByMonth,
  FindAttendaceByMonthName,
  OutTimeAttendance,
  FindOutOfAllAttendanceByMonth,
  FindOutOfAllAttendanceByMonthName,
};
