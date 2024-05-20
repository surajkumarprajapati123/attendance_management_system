const { LeaveModel, UserModel } = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");
const Schedule = require("node-schedule");
const {
  SendMailLeaveAppliation,
  ApprovedApplicationEmailTemplate,
  RejectApplicationEmailTemplate,
  TimeApplicationEmailTemplate,
  SendMailUpdatedLeaveAppliation,
} = require("./EmailSend");
const { UserUpdateWithIdService } = require("./admin.service");

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
function calculateDateDifference(startDate, endDate) {
  const startDateParts = startDate.split("/");
  const endDateParts = endDate.split("/");

  const start = new Date(
    startDateParts[2],
    startDateParts[1] - 1,
    startDateParts[0]
  );
  const end = new Date(endDateParts[2], endDateParts[1] - 1, endDateParts[0]);

  const difference = end.getTime() - start.getTime();

  const daysDifference = Math.floor(difference / (1000 * 60 * 60 * 24));
  const monthsDifference = Math.floor(daysDifference / 30);

  const remainingDays = daysDifference % 30;

  return `${remainingDays} days ${monthsDifference} months`;
}

const isValidDates = (startDate, endDate) => {
  const [sDay, sMonth, sYear] = startDate.split("/");
  const [eDay, eMonth, eYear] = endDate.split("/");
  const start = new Date(`${sYear}-${sMonth}-${sDay}`);
  const end = new Date(`${eYear}-${eMonth}-${eDay}`);
  return end > start;
};
const ApplyLeave = async (userid, usedata) => {
  const { startDate, endDate, reason } = usedata;
  const NewUser = await UserModel.findById(userid);
  const UserModelId = await LeaveModel.findOne({ employeeId: userid });
  console.log("find user is ", NewUser);

  if (UserModelId) {
    throw new ErrorHandler(
      "You are already for apply leave application,wait for action",
      401
    );
  }

  if (!NewUser) {
    throw new ErrorHandler("User is not found", 401);
  }
  const GenerateApplicationNumber = generateRandomString(5);
  const Application_Number =
    NewUser.name.toUpperCase().trim().split(" ")[0].slice(0, 3) +
    "00" +
    GenerateApplicationNumber;
  const totalleave = calculateDateDifference(startDate, endDate);
  if (!startDate || !endDate || !reason) {
    let errorMessage = "Missing fields: ";
    if (!startDate) errorMessage += "startDate, ";
    if (!endDate) errorMessage += "endDate, ";
    if (!reason) errorMessage += "reason";
    errorMessage = errorMessage.replace(/,\s*$/, ""); // Remove trailing comma and whitespace
    console.log(errorMessage);
    throw new ErrorHandler(errorMessage, 400);
  }
  if (!isValidDates(startDate, endDate)) {
    throw new ErrorHandler(
      "End date must be at least one day after start date.data formate DD/MM/YYYY",
      400
    );
  }

  const user = await LeaveModel.create({
    employeeId: userid,
    startDate,
    endDate,
    reason,
    application_no: Application_Number,
  });
  // user._id = undefined;
  // user.password = undefined;
  if (!user) {
    throw new ErrorHandler("User is not creating", 400);
  }
  await SendMailLeaveAppliation(
    NewUser.email,
    NewUser.username,
    Application_Number,
    startDate,
    endDate,
    totalleave
  );
  // console.log("new leave application user is ", user);
  return user;
};
const userdata = {
  startDate: "24/02/2024",
  endDate: "28/02/2024",
  reason: "important work at home",
};

// ApplyLeave("663caeed99d2f6f9c83bbed6", userdata);
const updateApplicationByid = async (userid, userdata) => {
  let user;
  const { startDate, endDate, reason, application_no } = userdata;
  if (!isValidDates(startDate, endDate)) {
    throw new ErrorHandler(
      "End date must be at least one day after start date . data formate DD/MM/YYYY",
      400
    );
  }
  const UserData = await UserModel.findById({ _id: userid });
  const useremail = UserData.email;
  const username = UserData.username;
  const leaveModel = await LeaveModel.findOne({ employeeId: userid });
  // console.log("leave model ", leaveModel);
  user = await LeaveModel.findOneAndUpdate({ _id: leaveModel._id }, userdata, {
    new: true,
  });
  // console.log("user id ", user);
  if (!user) {
    throw new ErrorHandler("User is not found", 400);
  }
  // console.log("Update user is ", user);
  const totalleave = calculateDateDifference(startDate, endDate);
  await SendMailUpdatedLeaveAppliation(
    useremail,
    username,
    leaveModel.application_no,
    leaveModel.startDate,
    leaveModel.endDate,
    totalleave
  );
  return user;
};
const updateApplicationByApplicationID = async (
  userid,
  userdata,
  application_no
) => {
  let user;
  // console.log("application number is ", application_no);
  const { startDate, endDate, reason } = userdata;
  const useremp = await LeaveModel.findOne({ employeeId: userid });
  const userdataformddb = await UserModel.findById({ _id: userid });
  // console.log("user for leave model ", useremp);
  // console.log("from user modle ", userdataformddb);
  const useremail = userdataformddb.email;
  const username = userdataformddb.username;
  if (!useremp) {
    throw new ErrorHandler("User not found", 401);
  }
  if (!isValidDates(startDate, endDate)) {
    throw new ErrorHandler(
      "End date must be at least one day after start date . data formate DD/MM/YYYY",
      400
    );
  }
  user = await LeaveModel.findOneAndUpdate(
    { application_no: application_no },
    userdata,
    {
      new: true,
    }
  );
  // console.log("user id ", user);
  if (!user) {
    throw new ErrorHandler("User is not found", 400);
  }
  const totalleave = calculateDateDifference(startDate, endDate);
  console.log("Update user is ", user);
  await SendMailUpdatedLeaveAppliation(
    useremail,
    username,
    user.application_no,
    user.startDate,
    user.endDate,
    totalleave
  );
  return user;
};

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
  console.log("user data is ", datausermodel);
  console.log("user detauls ", userdata);
  const totalleave = calculateDateDifference(
    userdata.startDate,
    userdata.endDate
  );
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
    totalleave
  );
  return userdata;
};
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
// RejectedLeave("6644857ba91e6ab2bf7de4ff", SomedataReason);

const TimeManagementForApplication = async (userid) => {
  try {
    const data = await LeaveModel.findOne({ employeeId: userid });
    console.log("time management data is ", data);
    const userdata = await UserModel.findById(userid);
    const useremail = userdata.email;
    const username = userdata.username;
    console.log("user data is ", userdata);
    if (!data) {
      throw new ErrorHandler("No previous application found", 404);
    }

    const DateAndtime = data.DateAndtime;

    // Calculate time elapsed since the last application
    const timeElapsed = Date.now() - DateAndtime.getTime();
    const minutesElapsed = Math.floor(timeElapsed / (60 * 1000));
    console.log("Time Elapsed (minutes):", minutesElapsed);

    // Calculate remaining time
    const timeRemaining = (2 - minutesElapsed) * 60 * 1000;
    console.log("Time remaining (milliseconds):", timeRemaining);

    // If remaining time is negative or zero, no need to schedule anything
    if (timeRemaining <= 0) {
      console.log("No action required. Time has already elapsed.");
      return;
    }

    // Schedule a job to send a notification after 2 minutes
    const scheduleTime = new Date(Date.now() + timeRemaining);
    console.log("Schedule time:", scheduleTime);

    const job = Schedule.scheduleJob(scheduleTime, async () => {
      data.block = false;
      await data.save();
      console.log("data", data);
      console.log(
        "2 minutes elapsed. Sending notification email... You can again send Leave application"
      );
      // await TimeApplicationEmailTemplate(
      //   useremail,
      //   username,
      //   data.application_no,
      //   timeRemaining
      // );
      // sendNotificationEmail(data.email, "Reapplication Notification", "You can now reapply for leave.");
    });

    data.block = true;
    // Calculate the time when the notification will be sent
    const notificationTime = new Date(Date.now() + timeRemaining);
    console.log("Notification will be sent at:", notificationTime);
  } catch (error) {
    console.error("Error in TimeManagementForApplication:", error.message);
    throw error; // Re-throwing the error for handling at the caller level
  }
};

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
  // ReApplyApplication,
  calculateDateDifference,
};
