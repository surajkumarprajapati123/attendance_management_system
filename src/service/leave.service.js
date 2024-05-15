const { LeaveModel, UserModel } = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");
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

// Generate a random application number

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
  const GenerateApplicationNumber = generateRandomString(5);
  console.log("GenerateApplicationNumber", GenerateApplicationNumber);
  const newname =
    NewUser.name.toUpperCase().trim().split(" ")[0].slice(0, 3) +
    "00" +
    GenerateApplicationNumber;
  console.log("new name is ", newname);
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
    application_no: newname,
  });
  if (!user) {
    throw new ErrorHandler("User is not creating", 400);
  }
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

module.exports = {
  ApplyLeave,
  updateApplicationByid,
  getPendingAllApplicationList,
  getrejectedAllApplicationList,
  getapprovedAllApplicationList,
  SearchbyApplicationNumber,
  updateApplicationByApplicationID,
};
