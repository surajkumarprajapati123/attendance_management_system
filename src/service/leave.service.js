const {
  LeaveModel,
  UserModel,
  AttendanceModel,
  LeaveTypeModel,
} = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");
const moment = require("moment");
const Schedule = require("node-schedule");
const {
  SendMailLeaveAppliation,
  ApprovedApplicationEmailTemplate,
  RejectApplicationEmailTemplate,
  TimeApplicationEmailTemplate,
  SendMailUpdatedLeaveAppliation,
} = require("./EmailSend");
const { UserUpdateWithIdService } = require("./admin.service");

// Import node-fetch library
const LeaveType = async () => {
  const leave = await LeaveTypeModel.findById({
    _id: "66595b843911fa076762c6b0",
  }).select("-_id -__v");
  console.log("total leave types is available", leave);
  return leave;
};
// LeaveType();

const HolidaysDays = async (HOLIDAYS_YEAR, HOLIDAYS_MONTH) => {
  try {
    const HOLIDAYS_COUNTRY = "IN"; // Provide the country code here

    const url = `https://calendarific.com/api/v2/holidays?api_key=${process.env.HOLIDAYS_API_KEY}&country=${HOLIDAYS_COUNTRY}&year=${HOLIDAYS_YEAR}`;

    const response = await fetch(url);
    const data = await response.json();
    let holidaysData = [];

    if (data.response && data.response.holidays) {
      const holidays = data.response.holidays;
      // console.log("Holidays is ", holidays);
      holidays.forEach((holiday) => {
        const obj = {
          Holidays_Name: holiday.name,
          Holidays_Date: holiday.date.iso,
        };
        holidaysData.push(obj);
      });

      if (HOLIDAYS_MONTH) {
        // Filter holidays by month
        holidaysData = holidaysData.filter((holiday) => {
          const holidayDate = new Date(holiday.Holidays_Date);
          return holidayDate.getMonth() === HOLIDAYS_MONTH - 1; // Months are zero-indexed
        });
      }

      // console.log("Holidays data:", holidaysData);
      return holidaysData;
    } else {
      console.log("No holidays found.");
      return [];
    }
  } catch (error) {
    console.log("Error:", error.message);
    throw error;
  }
};

// Example usage:
// HolidaysDays("2024").then((resulte) => {
// console.log("rsulte is ", resulte);
// }); // Get holidays for the year 2024
// HolidaysDays("2024", 5); // Get holidays for May 2024

// Function to generate a random string of specified length
const generateRandomString = (length) => {
  let result = "";
  const characters = "0123456789"; // Only digits
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// };

// Function to calculate the number of leave days excluding weekends and holidays
const calculateDays = async (startDate, endDate) => {
  // Convert start and end dates to Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Fetch holiday dates
  const holidays = await HolidaysDays("2024");
  // console.log("Holiday is ", holidays);
  const HolidaysArray = holidays.map((date) => date.Holidays_Date); // Extract date part only
  // console.log("Holidays array is", HolidaysArray);
  // Initialize count of days and counts for Saturdays, Sundays, and holidays
  let daysDifference = 0;
  let saturdayCount = 0;
  let sundayCount = 0;
  let holidaysCount = 0;
  let totalDays = 0;

  // Iterate through each day
  while (start <= end) {
    // Check if the current day is a holiday
    if (HolidaysArray.includes(start.toISOString().split("T")[0])) {
      holidaysCount++;
      console.log(
        "Holiday count is",
        holidaysCount,
        "and holiday date is",
        start.toISOString().split("T")[0]
      );
    } else {
      // Check if the current day is not Saturday (6) or Sunday (0)
      if (start.getDay() !== 6 && start.getDay() !== 0) {
        daysDifference++;
      } else {
        // Count Saturdays and Sundays
        if (start.getDay() === 6) {
          saturdayCount++;
        } else {
          sundayCount++;
        }
      }
    }

    // Move to the next day
    start.setDate(start.getDate() + 1);
  }
  totalDays = daysDifference + saturdayCount + sundayCount + holidaysCount;
  let obj = {
    totalDays: totalDays,
    DiffernceDays: daysDifference,
    saturdays: saturdayCount,
    sundays: sundayCount,
    holidayCount: holidaysCount,
  };
  return obj;
};

// // Example usage:
// const startDate = "2024-05-30"; // Monday
// const endDate = "2024-06-15"; // Wednesday
// calculateDays(startDate, endDate).then((result) => {
//   console.log("Total number of days:", result.totalDays);
//   console.log("Number of Saturdays:", result.saturdays);
//   console.log("Number of Sundays:", result.sundays);
//   console.log("Number of Holidays:", result.holidayCount);
// });

// calculateTotalDays("2024-10-02", "2024-10-05");

const ApplyLeave = async (userId, userData) => {
  const finduser = await LeaveModel.findOne({ employeeId: userId });
  const generate = generateRandomString(8);
  const userDetails = await UserModel.findById({ _id: userId });
  const username = userDetails.username;
  const useremail = userDetails.email;
  const Application_Number =
    username.slice(0, 3).toUpperCase() + "00" + generate;
  console.log("useris ", finduser);
  if (finduser) {
    throw new ErrorHandler("Already user exits ", 401);
  }
  const { employeeId, startDate, endDate, reason, leaveType } = userData;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check if start date is before end date
  if (start > end) {
    throw new Error("Start date cannot be after end date");
  }

  // Check if the start or end date is on a weekend
  if (
    start.getDay() === 6 ||
    start.getDay() === 0 ||
    end.getDay() === 6 ||
    end.getDay() === 0
  ) {
    throw new Error("It is a weekend day");
  }

  // Fetch holidays and check if the start date is a holiday
  const holidays = await HolidaysDays(start.getFullYear(), start.getMonth());
  const HolidaysArray = holidays.map((date) => date.Holidays_Date);
  if (HolidaysArray.includes(start.toISOString().split("T")[0])) {
    throw new Error(
      `This date ${start.toISOString().split("T")[0]} is already a holiday`
    );
  }

  // Calculate the number of leave days
  const numberOfDays = await calculateDays(start, end);
  console.log("total days is", numberOfDays);

  if (numberOfDays === -1) {
    throw new Error("You can't apply for leave on weekends or holidays");
  }

  // Extract total days from numberOfDays object and convert to string
  const days = numberOfDays.totalDays.toString();

  // Find the user's leave type balance
  const findLeaveType = await LeaveTypeModel.findOne({ user: userId });
  console.log("find leave Types is ", findLeaveType);
  const differenceDays = numberOfDays.DiffernceDays;
  console.log("diffrence data is ", differenceDays);

  if (!findLeaveType) {
    throw new Error("User is not found for leave types");
  }

  // Check the leave type and decrement the corresponding leave count by differenceDays
  if (leaveType === "sickLeave" && findLeaveType.sickLeave >= differenceDays) {
    findLeaveType.sickLeave -= differenceDays;
  } else if (
    leaveType === "casualLeave" &&
    findLeaveType.casualLeave >= differenceDays
  ) {
    findLeaveType.casualLeave -= differenceDays;
  } else if (
    leaveType === "parentalLeave" &&
    findLeaveType.parentalLeave >= differenceDays
  ) {
    findLeaveType.parentalLeave -= differenceDays;
  } else if (
    leaveType === "maternityLeave" &&
    findLeaveType.maternityLeave >= differenceDays
  ) {
    findLeaveType.maternityLeave -= differenceDays;
  } else if (
    leaveType === "paternityLeave" &&
    findLeaveType.paternityLeave >= differenceDays
  ) {
    findLeaveType.paternityLeave -= differenceDays;
  } else if (
    leaveType === "compensatoryLeave" &&
    findLeaveType.compensatoryLeave >= differenceDays
  ) {
    findLeaveType.compensatoryLeave -= differenceDays;
  } else if (
    leaveType === "bereavementLeave" &&
    findLeaveType.bereavementLeave >= differenceDays
  ) {
    findLeaveType.bereavementLeave -= differenceDays;
  } else {
    throw new Error("Insufficient leave days for the requested leave type");
  }
  // Save the updated leave type balance
  await findLeaveType.save();

  // Save leave request to database
  try {
    const leave = await LeaveModel.create({
      employeeId: userId,
      startDate: start,
      endDate: end,
      reason,
      status: "pending", // Assuming default status is pending
      days,
      leaveType,
      application_no: Application_Number, // Save total days as string
    });
    console.log("request leave is ", leave);
    await SendMailLeaveAppliation(
      useremail,
      username,
      Application_Number,
      startDate,
      endDate,
      days
    );
    return leave;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create leave application");
  }
};

// Example usage of the function
const leaveApplicationData = {
  // Replace with actual employee ID
  startDate: "2024-06-03", // Example start date
  endDate: "2024-06-17", // Example end date
  reason: "Vacation", // Example reason for leave
  status: "pending", // Example status
  // Example application number
  block: false, // Example block status
  DateAndtime: new Date(),
  leaveType: "casualLeave", // Example creation date and time
  // Will be calculated based on start and end date
};

// ApplyLeave("66497dca7ee0abf5d8160dd1", leaveApplicationData);
// 😁😁😁😁😁
const findLeaveTypeusingId = async (userID) => {
  if (!userId) {
    throw new ErrorHandler("invalid token", 401);
  }
  const leave = await LeaveTypeModel.findOne({ user: userID }).select(
    "-_id -__v -user"
  );
  if (!leave) {
    throw new ErrorHandler("Leave not found", 401);
  }
  console.log("updated leave type is ", leave);
  return leave;
};
// findLeaveTypeusingId("66497dca7ee0abf5d8160dd1");

const updateApplicationByid = async (leaveId, updateData) => {
  const { status, reason, startDate, endDate, leaveType } = updateData;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check if start date is before end date
  if (start > end) {
    throw new Error("Start date cannot be after end date");
  }

  // Check if the start or end date is on a weekend
  if (
    start.getDay() === 6 ||
    start.getDay() === 0 ||
    end.getDay() === 6 ||
    end.getDay() === 0
  ) {
    throw new Error("It is a weekend day");
  }

  // Fetch holidays and check if the start date is a holiday
  const holidays = await HolidaysDays(start.getFullYear(), start.getMonth());
  const HolidaysArray = holidays.map((date) => date.Holidays_Date);
  if (HolidaysArray.includes(start.toISOString().split("T")[0])) {
    throw new Error(
      `This date ${start.toISOString().split("T")[0]} is already a holiday`
    );
  }

  // Calculate the number of leave days
  const numberOfDays = await calculateDays(start, end);
  console.log("total days is", numberOfDays);

  if (numberOfDays === -1) {
    throw new Error("You can't apply for leave on weekends or holidays");
  }

  // Extract total days from numberOfDays object and convert to string
  const days = numberOfDays.totalDays.toString();
  const differenceDays = numberOfDays.DiffernceDays;

  // Find the user's leave type balance
  const leaveRequest = await LeaveModel.findOne({ employeeId: leaveId });
  const userdetals = await UserModel.findById({ _id: leaveId });

  const useremail = userdetals.email;
  const username = userdetals.username;
  // console.log("user details is ", userdetals);
  // console.log("leave request is ", leaveRequest);
  if (!leaveRequest) {
    throw new Error("Leave request not found");
  }

  const userId = leaveRequest.employeeId;
  const findLeaveType = await LeaveTypeModel.findOne({ user: userId });
  if (!findLeaveType) {
    throw new Error("User is not found for leave types");
  }

  // Check the leave type and decrement the corresponding leave count by differenceDays
  if (leaveType === "sickLeave" && findLeaveType.sickLeave >= differenceDays) {
    findLeaveType.sickLeave -= differenceDays;
  } else if (
    leaveType === "casualLeave" &&
    findLeaveType.casualLeave >= differenceDays
  ) {
    findLeaveType.casualLeave -= differenceDays;
  } else if (
    leaveType === "parentalLeave" &&
    findLeaveType.parentalLeave >= differenceDays
  ) {
    findLeaveType.parentalLeave -= differenceDays;
  } else if (
    leaveType === "maternityLeave" &&
    findLeaveType.maternityLeave >= differenceDays
  ) {
    findLeaveType.maternityLeave -= differenceDays;
  } else if (
    leaveType === "paternityLeave" &&
    findLeaveType.paternityLeave >= differenceDays
  ) {
    findLeaveType.paternityLeave -= differenceDays;
  } else if (
    leaveType === "compensatoryLeave" &&
    findLeaveType.compensatoryLeave >= differenceDays
  ) {
    findLeaveType.compensatoryLeave -= differenceDays;
  } else if (
    leaveType === "bereavementLeave" &&
    findLeaveType.bereavementLeave >= differenceDays
  ) {
    findLeaveType.bereavementLeave -= differenceDays;
  } else {
    throw new ErrorHandler(
      "Insufficient leave balance for the requested leave type",
      400
    );
  }

  // Save the updated leave type balance
  await findLeaveType.save();

  // Update leave request in the database
  leaveRequest.status = status || leaveRequest.status;
  leaveRequest.reason = reason || leaveRequest.reason;
  leaveRequest.startDate = startDate || leaveRequest.startDate;
  leaveRequest.endDate = endDate || leaveRequest.endDate;
  leaveRequest.days = days;
  leaveRequest.leaveType = leaveType || leaveRequest.leaveType;

  try {
    await leaveRequest.save();
    await SendMailUpdatedLeaveAppliation(
      useremail,
      username,
      leaveRequest.application_no,
      startDate,
      endDate,
      days
    );
    console.log("Leave request updated successfully", leaveRequest);
    return leaveRequest;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update leave application");
  }
};
// Example usage of the function
// const updateData = {
//   status: "approved", // Example new status
//   reason: "Personal reason", // Example new reason
//   startDate: "2024-06-10", // Example new start date
//   endDate: "2024-06-20", // Example new end date
//   leaveType: "casualLeave", // Example new leave type
// };

// // Call the function with example data

// updateApplicationByid("66497dca7ee0abf5d8160dd1", updateData)
//   .then((leave) => console.log("Leave update successful", leave))
//   .catch((error) => console.log("Error updating leave", error));

const updateApplicationByApplicationID = async (
  userid,
  application_no,
  updateData
) => {
  const userdetail = await LeaveModel.findOne({ employeeId: userid });
  if (!userdetail) {
    throw new Error("This user is not registered");
  }

  const { status, reason, startDate, endDate, leaveType } = updateData;

  // Ensure startDate and endDate are valid
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) {
    throw new Error("Invalid startDate or endDate");
  }

  // Check if start date is before end date
  if (start > end) {
    throw new Error("Start date cannot be after end date");
  }

  // Check if the start or end date is on a weekend
  if (
    start.getDay() === 6 ||
    start.getDay() === 0 ||
    end.getDay() === 6 ||
    end.getDay() === 0
  ) {
    throw new Error("It is a weekend day");
  }

  // Fetch holidays and check if the start date is a holiday
  console.log("start date is ", start.getFullYear());
  const holidays = await HolidaysDays(start.getFullYear(), start.getMonth());
  // console.log("holidays array is ", holidays);
  const HolidaysArray = holidays.map((date) => date.Holidays_Date);
  // console.log("Holidays dates are ", HolidaysArray);
  if (HolidaysArray.includes(start.toISOString().split("T")[0])) {
    throw new Error(
      `This date ${start.toISOString().split("T")[0]} is already a holiday`
    );
  }

  // Calculate the number of leave days
  const numberOfDays = await calculateDays(start, end);
  console.log("total days is", numberOfDays);

  if (numberOfDays === -1) {
    throw new Error("You can't apply for leave on weekends or holidays");
  }

  // Extract total days from numberOfDays object and convert to string
  const days = numberOfDays.totalDays.toString();
  const differenceDays = numberOfDays.DiffernceDays;

  // Find the leave request by application number
  const leaveRequest = await LeaveModel.findOne({ application_no });
  const userdetails = await UserModel.findOne({ _id: leaveRequest.employeeId });
  console.log("user details is ", userdetails);
  const useremail = userdetails.email;
  const username = userdetail.username;
  console.log("leave request is ", leaveRequest);
  if (!leaveRequest) {
    throw new Error("Leave request not found");
  }

  const userId = leaveRequest.employeeId;
  const findLeaveType = await LeaveTypeModel.findOne({ user: userId });
  if (!findLeaveType) {
    throw new Error("User is not found for leave types");
  }

  // Check the leave type and decrement the corresponding leave count by differenceDays
  if (leaveType === "sickLeave" && findLeaveType.sickLeave >= differenceDays) {
    findLeaveType.sickLeave -= differenceDays;
  } else if (
    leaveType === "casualLeave" &&
    findLeaveType.casualLeave >= differenceDays
  ) {
    findLeaveType.casualLeave -= differenceDays;
  } else if (
    leaveType === "parentalLeave" &&
    findLeaveType.parentalLeave >= differenceDays
  ) {
    findLeaveType.parentalLeave -= differenceDays;
  } else if (
    leaveType === "maternityLeave" &&
    findLeaveType.maternityLeave >= differenceDays
  ) {
    findLeaveType.maternityLeave -= differenceDays;
  } else if (
    leaveType === "paternityLeave" &&
    findLeaveType.paternityLeave >= differenceDays
  ) {
    findLeaveType.paternityLeave -= differenceDays;
  } else if (
    leaveType === "compensatoryLeave" &&
    findLeaveType.compensatoryLeave >= differenceDays
  ) {
    findLeaveType.compensatoryLeave -= differenceDays;
  } else if (
    leaveType === "bereavementLeave" &&
    findLeaveType.bereavementLeave >= differenceDays
  ) {
    findLeaveType.bereavementLeave -= differenceDays;
  } else {
    throw new Error("Insufficient leave balance for the requested leave type");
  }

  // Save the updated leave type balance
  await findLeaveType.save();

  // Update leave request in the database
  leaveRequest.status = status || leaveRequest.status;
  leaveRequest.reason = reason || leaveRequest.reason;
  leaveRequest.startDate = startDate || leaveRequest.startDate;
  leaveRequest.endDate = endDate || leaveRequest.endDate;
  leaveRequest.days = days;
  leaveRequest.leaveType = leaveType || leaveRequest.leaveType;

  try {
    await leaveRequest.save();
    await SendMailUpdatedLeaveAppliation(
      useremail,
      username,
      application_no,
      startDate,
      endDate,
      days
    );
    console.log("Leave request updated successfully", leaveRequest);
    return leaveRequest;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update leave application");
  }
};

// // Example usage of the function
// const updateData = {
//   status: "approved", // Example new status
//   reason: "Personal reason", // Example new reason
//   startDate: "2024-06-17", // Example new start date
//   endDate: "2024-06-20", // Example new end date
//   leaveType: "sickLeave", // Example new leave type
// };

// Call the function with example data
// updateApplicationByApplicationID(
//   "66497dca7ee0abf5d8160dd1",
//   "MAN0082157139",
//   updateData
// )
//   .then((leave) => console.log("Leave update successful", leave))
//   .catch((error) => console.log("Error updating leave", error));

const getPendingAllApplicationList = async () => {
  const data = await LeaveModel.find({ status: "pending" }).populate({
    path: "employeeId",
    select: "-password -_id -email",
  });
  const TotalPending = await LeaveModel.countDocuments({ status: "pending" });
  if (!data) {
    throw new ErrorHandler("User is not found", 400);
  }
  return { data, TotalPending };
};
const getrejectedAllApplicationList = async () => {
  const data = await LeaveModel.find({ status: "rejected" }).populate({
    path: "employeeId",
    select: "-password -_id -email",
  });

  const TotalReject = await LeaveModel.countDocuments({ status: "rejected" });
  if (!data) {
    throw new ErrorHandler("User is not found", 400);
  }
  return { data, TotalReject };
};
const getapprovedAllApplicationList = async () => {
  const data = await LeaveModel.find({ status: "approved" }).populate({
    path: "employeeId",
    select: "-password -_id -email",
  });
  const TotalApproved = await LeaveModel.countDocuments({ status: "approved" });
  if (!data) {
    throw new ErrorHandler("User is not found", 400);
  }
  return { data, TotalApproved };
};

const SearchbyApplicationNumber = async (Serachdata) => {
  const user = await LeaveModel.find({
    application_no: { $regex: Serachdata, $options: "i" },
  }).select("-_id");

  console.log("Search user is ", user);
  if (!user) {
    throw new ErrorHandler(
      `User is not found for This applicaiton ${application_no}`
    );
  }
  return user;
};
// (async () => {
//   try {
//     const updatedUser = await updateApplicationByApplicationID("12345", {
//       startDate: "28/02/2024",
//       endDate: "29/02/2024",
//       reason: "update by application id  ",
//     });
//     console.log("Updated user:", updatedUser);
//   } catch (error) {
//     console.error("Error updating application:", error);
//   }
// })();

const ApprovedLeave = async (userid) => {
  const userdata = await LeaveModel.findById({ _id: userid });
  const datausermodel = await UserModel.findById({ _id: userdata.employeeId });
  // console.log("user data is ", datausermodel);
  // console.log("user detauls ", userdata);
  const totalleave = await calculateDays(userdata.startDate, userdata.endDate);
  // console.log("Total leave is ", totalleave.totalDays);
  // console.log("totalleave", totalleave, "second time ", data.endDate);
  const useremail = datausermodel.email;
  const username = datausermodel.username;
  console.log("data is form approved system ", userdata);

  if (!userdata) {
    throw new ErrorHandler("User is not found", 401);
  }
  if (userdata.status == "rejected") {
    throw new ErrorHandler("Your applicaiton is Already Rejected", 400);
  }
  if (userdata.status == "approved") {
    throw new ErrorHandler("Your application is already Approved", 400);
  }
  userdata.status = "approved";
  userdata.DateAndtime = Date.now();
  userdata.save();
  await ApprovedApplicationEmailTemplate(
    useremail,
    username,
    userdata.application_no,
    userdata.startDate,
    userdata.endDate,
    totalleave.totalDays
  );
  return userdata;
};
// ApprovedLeave("665a8d735bd10586a1cf4508");
const RejectedLeave = async (userid, userdata1) => {
  const { reason } = userdata1;
  const leaves = await LeaveModel.findById({ _id: userid });
  console.log("Leave user is ", leaves);
  const userdata = await UserModel.findById({ _id: leaves.employeeId });
  console.log("user data is ", userdata);
  const useremail = userdata.email;

  const username = userdata.username;

  if (!leaves || leaves.length === 0) {
    throw new ErrorHandler("User is not found", 401);
  }

  // Iterate over each leave document and update status and reason
  if (leaves.status === "approved") {
    throw new ErrorHandler("This application is Already approved ", 400);
  }

  if (leaves.status === "rejected") {
    throw new ErrorHandler("Leave application is already rejected", 400);
  }

  if (!reason) {
    throw new ErrorHandler("Please provide a reason for rejection", 400);
  }

  // Update status and reason
  leaves.status = "rejected";
  leaves.reason = reason;
  leaves.block = true;
  leaves.DateAndtime = Date.now();

  // Save each leave document
  leaves.save();
  console.log("updated rejected leave", leaves);
  await RejectApplicationEmailTemplate(
    useremail,
    username,
    leaves.application_no,
    leaves.startDate,
    leaves.endDate
  );

  return leaves;
};
const SomedataReason = {
  reason: "only checking for time",
};
// RejectedLeave("665a8d735bd10586a1cf4508", SomedataReason);

// const TimeManagementForApplication = async (userid) => {
//   try {
//     const data = await LeaveModel.findOne({ employeeId: userid });
//     console.log("time management data is ", data);
//     const userdata = await UserModel.findById(userid);
//     const useremail = userdata.email;
//     const username = userdata.username;
//     console.log("user data is ", userdata);
//     if (!data) {
//       throw new ErrorHandler("No previous application found", 404);
//     }

//     const DateAndtime = data.DateAndtime;

//     // Calculate time elapsed since the last application
//     const timeElapsed = Date.now() - DateAndtime.getTime();
//     const minutesElapsed = Math.floor(timeElapsed / (60 * 1000));
//     console.log("Time Elapsed (minutes):", minutesElapsed);

//     // Calculate remaining time
//     const timeRemaining = (2 - minutesElapsed) * 60 * 1000;
//     console.log("Time remaining (milliseconds):", timeRemaining);

//     // If remaining time is negative or zero, no need to schedule anything
//     if (timeRemaining <= 0) {
//       console.log("No action required. Time has already elapsed.");
//       return;
//     }

//     // Schedule a job to send a notification after 2 minutes
//     const scheduleTime = new Date(Date.now() + timeRemaining);
//     console.log("Schedule time:", scheduleTime);

//     const job = Schedule.scheduleJob(scheduleTime, async () => {
//       data.block = false;
//       await data.save();
//       console.log("data", data);
//       console.log(
//         "2 minutes elapsed. Sending notification email... You can again send Leave application"
//       );
//       // await TimeApplicationEmailTemplate(
//       //   useremail,
//       //   username,
//       //   data.application_no,
//       //   timeRemaining
//       // );
//       // sendNotificationEmail(data.email, "Reapplication Notification", "You can now reapply for leave.");
//     });

//     data.block = true;
//     // Calculate the time when the notification will be sent
//     const notificationTime = new Date(Date.now() + timeRemaining);
//     console.log("Notification will be sent at:", notificationTime);
//   } catch (error) {
//     console.error("Error in TimeManagementForApplication:", error.message);
//     throw error; // Re-throwing the error for handling at the caller level
//   }
// };

const ReapplyLeaveApplication = async (userid, userdata) => {
  try {
    const { startDate, endDate, reason } = userdata;
    console.log("user is id ", userid);

    // Check if all required fields are provided
    if (!startDate || !endDate || !reason) {
      throw new ErrorHandler("All fields are required", 401);
    }

    // Check if dates are valid
    if (!isValidDates(startDate, endDate)) {
      throw new ErrorHandler(
        "End date must be at least one day after start date. Date format: DD/MM/YYYY",
        400
      );
    }

    // Find leave data for the user
    const data = await LeaveModel.findOne({ employeeId: userid });
    console.log("reapply dataus ", data);

    if (!data) {
      throw new ErrorHandler("No previous leave application found", 404);
    }

    // Check if user can reapply based on block status
    if (data.block === true && data.status == "rejected") {
      // Execute time management function
      await TimeManagementForApplication(userid);
    } else {
      // Update leave data with new details
      data.startDate = startDate;
      data.endDate = endDate;
      data.reason = reason;
      data.status = "pending"; // Assuming reapplications are pending by default
      data.DateAndtime = Date.now();

      // Save the updated leave data
      await data.save();
      console.log("Your data is sent and updated successfully", data);
      return data;
    }
  } catch (error) {
    console.error("Error in ReapplyLeaveApplication:", error.message);
    throw error; // Re-throwing the error for handling at the caller level
  }
};

// Example usage
const userId = "user123"; // Replace with actual user ID
const reapplyData = {
  startDate: new Date(),
  endDate: new Date(),
  reason: "Vacation",
};

// try {
//   // Reapply for leave
//   await ReapplyLeaveApplication(userId, reapplyData);
// } catch (error) {
//   console.error("Error:", error.message);
// }

// // If the leave status is rejected, allow reapplication

// // Example usage
// const userdata2 = {
//   startDate: "20/12/2024",
//   endDate: "25/12/2024",
//   reason: "Again send Leave Application",
// };

// Assuming user ID is provided as "user_id_here"/
// ReapplyLeaveApplication("6644857ba91e6ab2bf7de4ff", userdata2);
// ApprovedLeave("6644857ba91e6ab2bf7de4ff");

module.exports = {
  ApplyLeave,
  updateApplicationByid,
  getPendingAllApplicationList,
  getrejectedAllApplicationList,
  getapprovedAllApplicationList,
  SearchbyApplicationNumber,
  updateApplicationByApplicationID,
  ApprovedLeave,
  RejectedLeave,
  ReapplyLeaveApplication,
  HolidaysDays,
  LeaveType,
  findLeaveTypeusingId,
  // ReApplyApplication,
  // calculateDateDifference,
};
