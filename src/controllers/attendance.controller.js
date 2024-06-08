const { AttendanceService } = require("../service");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/CatchAsync");
const TakingAttendance = catchAsync(async (req, res) => {
  const attendance = await AttendanceService.TakeAttendance(req.user._id);
  ApiResponse(res, 201, "Attendance Taking successfully", attendance);
});

const TakingAttendaceByMannual = catchAsync(async (req, res) => {
  const attendance = await AttendanceService.TakingAttendanceMannual(
    req.user._id,
    req.body.location
  );
  ApiResponse(res, 200, "Attendance Successfully", attendance);
});

const FindAttendaceByMonth = catchAsync(async (req, res) => {
  const attendance = await AttendanceService.FindAttendaceByMonth(req.user._id);
  ApiResponse(res, 200, "Date fetched successfully", attendance);
});

const FindAttendaceByMonthName = catchAsync(async (req, res) => {
  const attendance = await AttendanceService.findAttendanceByMonthName(
    req.params.monthName
  );
  ApiResponse(res, 200, "Date fetched successfully", attendance);
});

const OutTimeAttendance = catchAsync(async (req, res) => {
  // console.log("user id is", req.user);
  const attendance = await AttendanceService.OutTimeAttendance(req.user._id);
  ApiResponse(res, 200, "Data fetched successfully", attendance);
});

const FindOutOfAllAttendanceByMonth = catchAsync(async (req, res) => {
  // console.log("user id is", req.user._id);
  const attendance = await AttendanceService.FindOutTimeAttendaceByCurrentMonth(
    req.user._id
  );
  // console.log("attendacen is ", attendance);
  ApiResponse(res, 200, "Date Fetched successfully", attendance);
});

const FindOutOfAllAttendanceByMonthName = catchAsync(async (req, res) => {
  const attendance = await AttendanceService.FindOutTimeAttendaceByMonthName(
    req.params.monthName
  );
  ApiResponse(res, 200, "Date Fetched successfully", attendance);
});

const FindOutTimeAttendanceByMonthByUseridController = catchAsync(
  async (req, res) => {
    const attendance =
      await AttendanceService.FindOutTimeAttendanceByMonthByUserid(
        req.user._id,
        req.body.year,
        req.body.month,
        req.body.numberOfDays
      );
    // console.log(
    //   req.user._id,
    //   req.body.year,
    //   req.body.month,
    //   req.body.numberOfDays
    // );
    ApiResponse(res, 200, " data Fetched successfullt ", attendance);
  }
);
const FindOutTimeAttendanceByMonthByAnyUserIDAdmin = catchAsync(
  async (req, res) => {
    const attendance =
      await AttendanceService.FindOutTimeAttendanceByMonthByAdminOnly(
        req.params.userId,
        req.body.year,
        req.body.month
      );
    // console.log("data is ", attendance);
    ApiResponse(res, 200, " data Fetched successfully ", attendance);
  }
);

const FindAllPresentUser = catchAsync(async (req, res) => {
  const attendance = await AttendanceService.findAllPresentUser();
  ApiResponse(res, 200, " data Fetched successfully ", attendance);
});

const FindOutTimeAttendanceByMonthByUseridAdmin2 = catchAsync(
  async (req, res) => {
    const attendance =
      await AttendanceService.FindOutTimeAttendanceByMonthByUserid(
        req.user.params,
        req.body.year,
        req.body.month,
        req.body.numberOfDays
      );
    ApiResponse(res, 200, " data Fetched successfully ", attendance);
  }
);

const FindAllAbsentUuser = catchAsync(async (req, res) => {
  const attendance = await AttendanceService.findALLAbsentUser();
  ApiResponse(res, 200, " data Fetched successfully ", attendance);
});
const FindAttendanceByMonthByAdminOnly = catchAsync(async (req, res) => {
  const attendance =
    await AttendanceService.FindOutTimeAttendanceByMonthByAdminOnly2(
      req.user._id,
      req.body.startDate,
      req.body.endDate
    );
  ApiResponse(res, 200, " data Fetched successfully ", attendance);
});
const FindAttendanceByMonthByAdminOnlyUserID = catchAsync(async (req, res) => {
  const attendance =
    await AttendanceService.FindOutTimeAttendanceByMonthByAdminOnly2(
      req.params.UserId,
      req.body.startDate,
      req.body.endDate
    );
  ApiResponse(res, 200, " data Fetched successfully ", attendance);
});

const FindAttendaceUsingDays = catchAsync(async (req, res) => {
  const attendance = await AttendanceService.FindOutTimeAttendanceByMonthByDays(
    req.body.year,
    req.body.month,
    req.body.numberOfDays
  );
  ApiResponse(res, 200, " data Fetched successfully ", attendance);
});
module.exports = {
  TakingAttendance,
  TakingAttendaceByMannual,
  FindAttendaceByMonth,
  FindAttendaceByMonthName,
  OutTimeAttendance,
  FindOutOfAllAttendanceByMonth,
  FindOutOfAllAttendanceByMonthName,
  FindOutTimeAttendanceByMonthByUseridController,
  FindOutTimeAttendanceByMonthByAnyUserIDAdmin,
  FindAllPresentUser,
  FindAllAbsentUuser,
  FindAttendanceByMonthByAdminOnly,
  FindAttendanceByMonthByAdminOnlyUserID,
  FindAttendaceUsingDays,
};
