const { LeaveModel, UserModel } = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");
const { SendMailLeaveAppliation } = require("./EmailSend");
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
  if (NewUser) {
    throw new ErrorHandler("You are alredy applied for leave", 401);
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
  if (!user) {
    throw new ErrorHandler("User is not creating", 400);
  }
  // await SendMailLeaveAppliation(
  //   NewUser.email,
  //   NewUser.username,
  //   Application_Number,
  //   startDate,
  //   endDate,
  // totalleave
  // );
  console.log("new leave application user is ", user);
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
  user = await LeaveModel.findOneAndUpdate({ _id: userid }, userdata, {
    new: true,
  });
  //   console.log("user id ", user);
  if (!user) {
    throw new ErrorHandler("User is not found", 400);
  }
  //   console.log("Update user is ", user);
  return user;
};
const updateApplicationByApplicationID = async (userdata) => {
  let user;
  const { startDate, endDate, reason, application_no } = userdata;
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
  //   console.log("user id ", user);
  if (!user) {
    throw new ErrorHandler("User is not found", 400);
  }
  console.log("Update user is ", user);
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
  });

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
  const data = await LeaveModel.findById(userid);

  if (!data) {
    throw new ErrorHandler("User is not found", 401);
  }
  if (data.status == "rejected") {
    throw new ErrorHandler("Your applicaiton is Already Rejected", 400);
  }
  if (data.status == "approved") {
    throw new ErrorHandler("Your application is already Approved", 400);
  }
  data.status = "approved";
  data.save();

  return data;
};
const RejectedLeave = async (userid, userdata) => {
  const { reason } = userdata;
  const leaves = await LeaveModel.find({ employeeId: userid });

  if (!leaves || leaves.length === 0) {
    throw new ErrorHandler("User is not found", 401);
  }

  // Iterate over each leave document and update status and reason
  for (const leave of leaves) {
    if (leave.status === "rejected") {
      throw new ErrorHandler("Leave application is already rejected", 400);
    }

    if (!reason) {
      throw new ErrorHandler("Please provide a reason for rejection", 400);
    }

    // Update status and reason
    leave.status = "rejected";
    leave.reason = reason;

    // Save each leave document
    await leave.save();
  }

  return leaves;
};

const isValidDateFormat = (dateString) => {
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  return dateRegex.test(dateString);
};

const ReApplyApplication = async (userid, userdata) => {
  const { startDate, endDate, reason } = userdata;
  const data = await LeaveModel.findOne({ employeeId: userid });
  // const oldStartDate = data.startDate;
  // const oldEndDate = data.endDate;
  // console.log("oldStartDate", oldStartDate);
  // console.log("oldEndDate", oldEndDate);

  // // Check if the new dates are valid and at least one day apart from the old dates
  // if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
  //   throw new ErrorHandler(
  //     "Invalid date format. Date format must be DD/MM/YYYY.",
  //     400
  //   );
  // }

  // const [startDay, startMonth, startYear] = startDate.split("/");
  // const [endDay, endMonth, endYear] = endDate.split("/");

  // const newStartDate = new Date(startYear, startMonth - 1, startDay); // Months are 0-indexed in JavaScript
  // const newEndDate = new Date(endYear, endMonth - 1, endDay);

  // // Calculate the difference in days between old and new dates
  // const diffInDays =
  //   (newEndDate.getTime() - newStartDate.getTime()) / (1000 * 3600 * 24);

  // // Check if there is at least one day gap between old and new dates
  // if (diffInDays < 1) {
  //   throw new ErrorHandler(
  //     "There must be at least one day gap between old and new leave dates.",
  //     400
  //   );
  // }

  // // Check if the old leave is not already approved or rejected
  // if (data.status === "approved" || data.status === "rejected") {
  //   throw new ErrorHandler(
  //     "Cannot reapply for leave. Previous application is already processed.",
  //     400
  //   );
  // }

  // // Update the leave application details with new data
  // data.startDate = startDate;
  // data.endDate = endDate;
  // data.reason = reason;

  // // Save the updated leave application
  // await data.save();

  // console.log("reapply application ", await data);
  return data;
};
(async () => {
  const data = await ReApplyApplication("6644857ba91e6ab2bf7de4ff", "some");
  console.log(data.DateAndtime);
})();
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
  ReApplyApplication,
};
