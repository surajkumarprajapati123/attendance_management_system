const { AttendanceModel, UserModel } = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");
const schedule = require("node-schedule");
const moment = require("moment");
const mongoose = require("mongoose");
const takingLocation = async () => {
  try {
    const response = await fetch(
      `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.GEO_API}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }
    let obj = {};
    const data = await response.json();

    console.log("Location is ", data);
    obj = {
      Country_Name: data.country_name,
      State: data.state_prov,
      city: data.city,
      zip_code: data.zipcode,
    };
    const newObject = Object.values(obj).join(",");
    // console.log("object data is ", newObject);
    return newObject;
  } catch (error) {
    console.error(error);
  }
};

const TakeAttendance = async (userid) => {
  const user = await AttendanceModel.findOne({ userid: userid });
  if (user) {
    throw new ErrorHandler("Alredy taking attendance", 401);
  }
  const newObject = await takingLocation();

  console.log("locatio form taking attendance", newObject);
  const attendance = await AttendanceModel.create({
    userid,
    // Intime,
    location: newObject,
    status: "present",
    istime: true,
  });
  console.log("Create Attendance data is ", attendance);
  return attendance;
};

// const job = schedule.scheduleJob("*/5 * * * * *", function () {

//   console.log("The answer to life, the universe, and everything!");
// });
const rawdata = {
  location: "Noida",
  status: "present",
};

// TakeAttendance("66482adfe6e69f140a372dc6");

const FindAttendaceByMonth = async (userId) => {
  const attendance = await AttendanceModel.findOne({ userid: userId });
  if (!attendance) {
    throw new ErrorHandler("User not found", 401);
  }
  const attendanceByMonth = await AttendanceModel.aggregate([
    {
      $project: {
        year: { $year: "$Intime" }, // Include year in the projection
        month: { $month: "$Intime" },
        date: { $dateToString: { format: "%d/%m/%Y", date: "$Intime" } },
        monthName: { $month: "$Intime" },
      },
    },
    {
      $group: {
        _id: {
          year: "$year",
          month: "$month",
          monthName: "$monthName",
          date: "$date",
        },
        attendanceCount: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: {
          year: "$_id.year",
          month: "$_id.month",
          monthName: "$_id.monthName",
        },
        attendanceByDate: {
          $push: {
            date: "$_id.date",
            attendanceCount: "$attendanceCount",
          },
        },
        totalAttendance: { $sum: "$attendanceCount" },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year", // Include year in the output
        month: "$_id.month",
        monthName: "$_id.monthName",
        attendanceByDate: 1,
        totalAttendance: 1,
      },
    },
  ]);

  const attendanceObj = {};
  const monthNames = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };

  attendanceByMonth.forEach((data) => {
    const { year, month, monthName, attendanceByDate, totalAttendance } = data;
    const monthKey = `${month}-${monthNames[monthName]}-${year}`; // Include year in the key

    const dates = attendanceByDate.map((res) => res.date); // Extract dates from attendanceByDate

    attendanceObj[monthKey] = {
      attendanceByDate: dates, // Use dates array instead of attendanceByDate array
      TotalAttendance: totalAttendance,
      MonthName: monthNames[monthName],
    };
  });

  console.log("Attendance by month code", attendanceObj);
  return attendanceObj;
};

const findAttendanceByMonthName = async (userId, monthNameOrYear) => {
  const attendance = await AttendanceModel.findOne({ userid: userId });
  if (!attendance) {
    throw new ErrorHandler("User not found", 401);
  }

  let filter = {};
  if (!isNaN(monthNameOrYear)) {
    // If the parameter is a number, assume it's a year
    filter = {
      $expr: { $eq: [{ $year: "$Intime" }, parseInt(monthNameOrYear)] },
    };
  } else {
    // Otherwise, assume it's a month name
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthNumber =
      monthNames.findIndex(
        (name) => name.toLowerCase() === monthNameOrYear.toLowerCase()
      ) + 1;
    filter = { $expr: { $eq: [{ $month: "$Intime" }, monthNumber] } };
  }

  const attendanceByMonthName = await AttendanceModel.aggregate([
    { $match: { userid: userId, ...filter, status: "present" } }, // Match by userid
    {
      $lookup: {
        from: "users",
        localField: "userid",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: "%Y-%m-%d", date: "$Intime" } },
        time: { $dateToString: { format: "%H:%M:%S", date: "$Intime" } },
        user: "$user.name",
      },
    },
  ]);

  const totalPresentUsers = attendanceByMonthName.length;

  console.log("Total present users:", totalPresentUsers);
  console.log("Attendance data:", attendanceByMonthName);

  return { totalPresentUsers, attendance: attendanceByMonthName };
};

const OutTimeAttendance = async (userid) => {
  const attendance = await AttendanceModel.findOne({ userid: userid });
  if (!attendance) {
    throw new ErrorHandler("User is not found", 401);
  }
  // if (attendance.status == "absent") {
  //   throw new ErrorHandler("You are already absent");
  // }
  console.log("fetching data from database", attendance);
  const userIntime = attendance.Intime;
  // console.log("user time is", userIntime);
  const convertIntime = new Date(userIntime);
  // console.log("convert time is ", convertIntime);
  const currentTiem = new Date();
  const diffMilliseconds = convertIntime - currentTiem;

  // Convert the difference to minutes and hours
  const diffMinutes = Math.abs(Math.floor(diffMilliseconds / (1000 * 60)));
  // const diffHours = Math.abs(Math.floor(diffMilliseconds / (1000 * 60 * 60)));
  console.log("Difference in minutes:", diffMinutes);
  console.log("Datebase time ", convertIntime.toLocaleTimeString());
  console.log("present time is ", currentTiem.toLocaleTimeString());
  if (diffMinutes > 5) {
    console.log("You are lout in the office ");
    attendance.status = "present";
    attendance.Outtime = undefined;

    attendance.save();
    console.log("attendate data is with in a time  ", attendance);
    return attendance;
  } else {
    attendance.status = "absent";
    attendance.Outtime = new Date();
    attendance.save();
    console.log("update data is out side time ", attendance);
    return attendance;
  }
};

// OutTimeAttendance("66482adfe6e69f140a372dc6");

const FindOutTimeAttendaceByMonth = async (userid) => {
  if (!mongoose.Types.ObjectId.isValid(userid)) {
    throw new Error("Invalid userid");
  }
  const matchStage = {
    $match: {
      _id: new mongoose.Types.ObjectId(userid), // Correct usage of ObjectId constructor
    },
  };
  const attendanceByMonth = await UserModel.aggregate([
    matchStage,
    {
      $lookup: {
        from: "attendances",
        localField: "_id",
        foreignField: "userid",
        as: "attendance",
      },
    },
    {
      $project: {
        _id: 0,
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        monthName: { $month: "$createdAt" },
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        status: {
          $cond: {
            if: { $eq: [{ $size: "$attendance" }, 0] }, // Check if user has no attendance record
            then: "absent", // User is absent if no attendance record
            else: {
              $cond: [
                { $eq: ["$attendance.status", "absent"] }, // Check if user's attendance status is absent
                "absent", // User is absent if attendance status is absent
                "present", // User is present if attendance status is not absent
              ],
            },
          },
        },
        name: 1,
        email: 1, // Include user's name
      },
    },
    {
      $group: {
        _id: { year: "$year", month: "$month", monthName: "$monthName" },
        absentByDate: { $push: "$date" },
        totatAbsent: { $sum: 1 },
        names: { $push: "$name" },
        email: { $push: "$email" }, // Collect user names
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        monthName: "$_id.monthName",
        absentByDate: 1,
        totatAbsent: 1,
        names: 1,
        email: 1,
      },
    },
  ]);

  const attendanceObj = {};
  const monthNames = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };

  attendanceByMonth.forEach((data) => {
    const { year, month, monthName, absentByDate, totatAbsent, names, email } =
      data;
    const monthKey = `${month}-${monthNames[monthName]}-${year}`; // Include year in the key

    attendanceObj[monthKey] = {
      absentByDate,
      totatAbsent,
      MonthName: monthNames[monthName],
      UserNames: names.filter((name) => name),
      UserEmail: email.filter((email) => email), // Filter out null or undefined names
    };

    // Update attendance status of users who are not present
    // names.forEach(async (name) => {
    //   const user = await UserModel.findOne({ name });
    //   if (!user) return; // Skip if user not found
    //   const attendance = await AttendanceModel.findOne({ userid: user._id });
    //   if (!attendance) {
    //     // Create attendance record for absent users
    //     await AttendanceModel.create({
    //       userid: user._id,
    //       Intime: new Date(), // Set current date and time as Intime
    //       status: "absent",
    //     });
    //   }
    // });
  });

  // console.log("Attendance by month:", attendanceObj);
  return attendanceObj;
};

// FindOutTimeAttendaceByMonth();

const FindOutTimeAttendaceByMonthName = async (monthName) => {
  // const attendance = await AttendanceModel.findOne({ userid: userid });
  // if (!attendance) {
  //   throw new ErrorHandler("User is not found", 401);
  // }
  // Define mapping for month names
  // if (typeof monthName === "string") {
  monthName = monthName.toLowerCase();
  // } else {
  //   console.error("monthName is not a string");
  // }

  // Define mapping for month names
  const monthNames = {
    1: "january",
    2: "february",
    3: "march",
    4: "april",
    5: "may",
    6: "june",
    7: "july",
    8: "august",
    9: "september",
    10: "october",
    11: "november",
    12: "december",
  };

  // Get the month number from the month name
  const monthNumber = Object.keys(monthNames).find(
    (key) => monthNames[key] === monthName
  );

  // If the provided month name is invalid, return empty array
  if (!monthNumber) {
    console.log("Invalid month name");
    return [];
  }

  const attendanceByMonth = await UserModel.aggregate([
    {
      $match: {
        $expr: { $eq: [{ $month: "$createdAt" }, parseInt(monthNumber)] },
      },
    },
    {
      $lookup: {
        from: "attendances",
        localField: "_id",
        foreignField: "userid",
        as: "attendance",
      },
    },
    {
      $project: {
        _id: 0,
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        monthName: parseInt(monthNumber), // Convert month number to integer
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        // status: {
        //   $cond: {
        //     if: { $eq: [{ $size: "$attendance" }, 0] },
        //     then: "absent",
        //     else: {
        //       $cond: [
        //         {
        //           $eq: [{ $arrayElemAt: ["$attendance.status", 0] }, "absent"],
        //         },
        //         "absent",
        //         "present",
        //       ],
        //     },
        //   },
        // },
        name: 1,
        email: 1,
      },
    },
    {
      $group: {
        _id: { year: "$year", month: "$month", monthName: "$monthName" },
        AbsentByDate: { $push: "$date" },
        totalAbsent: { $sum: 1 },
        names: { $push: "$name" },
        email: { $push: "$email" },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        monthName: {
          $arrayElemAt: [Object.values(monthNames), parseInt(monthNumber) - 1],
        }, // Convert month number to index and get month name from array
        AbsentByDate: 1,
        totalAbsent: 1,
        names: 1,
        email: 1,
      },
    },
  ]);

  // console.log("Attendance by month:", attendanceByMonth);
  return attendanceByMonth;
};

// FindOutTimeAttendaceByMonthName("may");

// console.log("process.env.GEO_API", process.env.GEO_API);

// takingLocation();

// findAttendanceByMonthName("march");

const findAdminAttendanceByMonthName = async (userId, monthNameOrYear) => {
  const attendance = await AttendanceModel.findOne({ userid: userId });
  if (!attendance) {
    throw new ErrorHandler("User not found", 401);
  }

  let filter = {};
  if (!isNaN(monthNameOrYear)) {
    // If the parameter is a number, assume it's a year
    filter = {
      $expr: { $eq: [{ $year: "$Intime" }, parseInt(monthNameOrYear)] },
    };
  } else {
    // Otherwise, assume it's a month name
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthNumber =
      monthNames.findIndex(
        (name) => name.toLowerCase() === monthNameOrYear.toLowerCase()
      ) + 1;
    filter = { $expr: { $eq: [{ $month: "$Intime" }, monthNumber] } };
  }

  const attendanceByMonthName = await AttendanceModel.aggregate([
    { $match: { ...filter, status: "present" } },
    {
      $lookup: {
        from: "users",
        localField: "userid",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: "%Y-%m-%d", date: "$Intime" } },
        time: { $dateToString: { format: "%H:%M:%S", date: "$Intime" } },
        user: "$user.name",
      },
    },
  ]);

  const totalPresentUsers = attendanceByMonthName.length;

  // console.log("Total present users:", totalPresentUsers);
  // console.log("Attendance data:", attendanceByMonthName);

  return { totalPresentUsers, attendance: attendanceByMonthName };
};
module.exports = {
  TakeAttendance,
  FindAttendaceByMonth,
  findAttendanceByMonthName,
  OutTimeAttendance,
  FindOutTimeAttendaceByMonth,

  FindOutTimeAttendaceByMonthName,
};
