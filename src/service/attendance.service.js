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

    // console.log("Location is ", data);
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
// takingLocation();

// ipinfo location

// const takinglocaitoipingo = async () => {
//   try {
//     const response = await fetch(
//       `https://ipinfo.io/json?token=${process.env.IP_INFO_API}`
//     );
//     if (!response.ok) {
//       throw new Error("Failed to fetch location data");
//     }
//     const data = await response.json();
//     console.log("location data is ", data);
//     const { loc } = data;
//     const [latitude, longitude] = loc.split(",").map(parseFloat);
//     // res.json({ latitude, longitude });
//     console.log({ latitude, longitude });
//   } catch (error) {
//     console.error(error);
//     // res.status(500).json({ error: 'Failed to fetch location data' });
//   }
// };

// takinglocaitoipingo();

const TakingAttendanceMannual = async (userid, userdata) => {
  const user = await AttendanceModel.findOne({ userid: userid });
  if (user) {
    throw new ErrorHandler("Alredy taking attendance", 401);
  }
  const { location } = userdata;
  if (!location) {
    throw new ErrorHandler("Please Enter the location", 401);
  }

  const attendance = await AttendanceModel.create({
    userid,
    // Intime,
    location,
    status: "present",
    istime: true,
  });
  // console.log("New attendance is mannul create", attendance);
  return attendance;
};
const userdatea = {
  location: "Nodia",
};

// TakingAttendanceMannual("66482adfe6e69f140a372dc6", userdatea);
const TakeAttendance = async (userid) => {
  const user = await AttendanceModel.findOne({ userid: userid });
  if (user) {
    throw new ErrorHandler("Alredy taking attendance", 401);
  }
  const newObject = await takingLocation();

  // console.log("locatio form taking attendance", newObject);
  const attendance = await AttendanceModel.create({
    userid,
    // Intime,
    location: newObject,
    status: "present",
    istime: true,
  });
  // console.log("Create Attendance data is ", attendance);
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

  // console.log("Attendance by month code", attendanceObj);
  return attendanceObj;
};

const findAttendanceByMonthName = async (MonthName) => {
  let filter = {};
  if (!isNaN(MonthName)) {
    // If the parameter is a number, assume it's a year
    filter = {
      $expr: { $eq: [{ $year: "$Intime" }, parseInt(MonthName)] },
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
        (name) => name.toLowerCase() === MonthName.toLowerCase()
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
        // time: { $dateToString: { format: "%H:%M:%S", date: "$Intime" } },
        user: "$user.name",
        email: "$user.email", // Include email field
      },
    },
  ]);
  let obj = {
    AttendanceData: attendanceByMonthName.map((entry) => entry.date),
    UserName: attendanceByMonthName.map((entry) => entry.user),
    UserEmail: attendanceByMonthName.map((entry) => entry.email),
    TotalAttendaceCount: attendanceByMonthName.length,
  };

  // const totalPresentUsers = attendanceByMonthName.length;
  // console.log("attendanceByMonthName", attendanceByMonthName);
  // console.log("Total present users:", obj);
  // console.log("Attendance data:", attendanceByMonthName);

  return obj;
};

const findAllPresentUser = async () => {
  const allPresentUsers = await AttendanceModel.aggregate([
    {
      $match: {
        // Match documents where the date field exists
        status: "present",
      },
    },
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
        Intime: {
          $dateToString: { format: "%Y-%m-%d %H:%M", date: "$Intime" },
        }, // Include the Intime field with formatted date and time
        id: "$user._id",
        email: "$user.email",
        name: "$user.name",
      },
    },

    {
      $group: {
        _id: null,
        users: {
          $push: {
            name: "$name",
            email: "$email",
            Intime: "$Intime",
            Id: "$id",
          },
        },
        TotalUserPresent: { $sum: 1 },
      },
    },
  ]);
  // console.log("allPresentUsers[0].users", allPresentUsers[0].users);

  const formattedOutput = allPresentUsers[0].users.map((user) => ({
    UserID: user.Id.toString(),
    Username: user.name,
    UserEmail: user.email,
    AttendaceDate: user.Intime.split(" ")[0],
    AttendaceTime: user.Intime.split(" ")[1],
  }));

  const totalAttendaceUser = allPresentUsers[0].TotalUserPresent;

  const output = [
    ...formattedOutput,
    { TotalAttendaceUser: totalAttendaceUser },
  ];

  // console.log("Output object is ", output);
  return output;
};

// 😀😀
// findAllPresentUser().then((result) => {
//   console.log("Resute is ", result);
// });
const findALLAbsentUser = async () => {
  const absentAllUser = await AttendanceModel.aggregate([
    {
      $match: {
        status: "absent",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userid",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: 0,
        Outtime: {
          $dateToString: { format: "%Y-%m-%d %H:%M", date: "$Outtime" },
        },
        id: "$user._id",
        name: "$user.name",
        email: "$user.email",
      },
    },
    {
      $group: {
        _id: null,
        users: {
          $push: {
            name: "$name",
            email: "$email",
            Outtime: "$Outtime",
            id: "$id",
          },
        },
        TotalAbsentUser: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        users: 1,
        TotalAbsentUser: 1,
      },
    },
  ]);

  // console.log("data1 ", absentAllUser);
  // console.log("data2 ", absentAllUser[0]);
  // console.log("data3 ", absentAllUser[0].users);
  let outputformat = absentAllUser[0].users.map((user) => ({
    UserId: user.id.toString(),
    UserName: user.name,
    UserEmail: user.email,
    Absent_Date: user.Outtime && user.Outtime.split(" ")[0], // Check if Outtime is not null
    Absent_Time: user.Outtime && user.Outtime.split(" ")[1], // Check if Outtime is not null
  }));

  const TotalAbsentUser = absentAllUser[0].TotalAbsentUser;
  const output = [...outputformat, { TotalAbsentUser: TotalAbsentUser }];

  // console.log("Final output is ", output);
  return output;
};

// findALLAbsentUser().then((result) => {
//   console.log("Resute is ", result);
// });

const OutTimeAttendance = async (userid) => {
  try {
    const attendance = await AttendanceModel.findOne({ userid: userid });
    if (!attendance) {
      throw new ErrorHandler("User is not found", 401);
    }
    // console.log("Total working hours ", process.env.WORKING_HOURS);

    const userIntime = attendance.Intime;
    const convertIntime = new Date(userIntime);
    const currentTiem = new Date();

    // Ensure the Intime and current time are on the same date
    const isSameDate =
      convertIntime.getFullYear() === currentTiem.getFullYear() &&
      convertIntime.getMonth() === currentTiem.getMonth() &&
      convertIntime.getDate() === currentTiem.getDate();

    if (!isSameDate) {
      attendance.status = "absent";
      attendance.Outtime = currentTiem;
      await attendance.save();
      // console.log(
      //   "Attendance updated to absent due to date mismatch:",
      //   attendance
      // );
      return attendance;
    }

    const diffMilliseconds = currentTiem - convertIntime;
    const diffMinutes = Math.abs(Math.floor(diffMilliseconds / (1000 * 60)));
    const diffHours = Math.floor(diffMinutes / 60);

    // console.log("Difference in minutes:", diffMinutes);
    // console.log("Database time:", convertIntime.toLocaleTimeString());
    // console.log("Present time:", currentTiem.toLocaleTimeString());
    // console.log("Total working hours ", process.env.WORKING_HOURS);
    if (diffHours > process.env.WORKING_HOURS) {
      attendance.status = "present";
      attendance.Outtime = undefined;
      await attendance.save();
      // console.log(
      //   "Attendance marked as present within allowed time:",
      //   attendance
      // );
    } else {
      attendance.status = "absent";
      attendance.Outtime = currentTiem;
      await attendance.save();
      // console.log(
      //   "Attendance marked as absent outside allowed time:",
      //   attendance
      // );
    }

    return attendance;
  } catch (error) {
    console.error("Error processing attendance:", error);
    throw error;
  }
};

// OutTimeAttendance("66482adfe6e69f140a372dc6");

const FindOutTimeAttendaceByCurrentMonth = async (userid) => {
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
      $unwind: "$attendance",
    },
    {
      $match: {
        "attendance.status": "absent",
      },
    },
    {
      $project: {
        _id: 0,
        year: { $year: "$attendance.createdAt" },
        month: { $month: "$attendance.createdAt" },
        monthName: { $month: "$attendance.createdAt" },
        date: {
          $dateToString: { format: "%Y-%m-%d", date: "$attendance.createdAt" },
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
  // console.log("Attendace month is ", attendanceByMonth);
  // attendanceByMonth.forEach((data) => {
  //   const { year, month, monthName, absentByDate, totatAbsent, names, email } =
  //     data;
  //   const monthKey = `${month}-${monthNames[monthName]}-${year}`; // Include year in the key

  //   attendanceObj[monthKey] = {
  //     absentByDate,
  //     totatAbsent,
  //     MonthName: monthNames[monthName],
  //     UserNames: names[0].map((data) => data.name),
  //     UserEmail: email[0].map((data) => data.email), // Filter out null or undefined names
  //   };
  // });
  function getMonthName(monthNumber) {
    const months = [
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
    return months[monthNumber - 1]; // Adjust for zero-based indexing
  }
  const transformedData = attendanceByMonth.map((data) => {
    const { absentByDate, totatAbsent, names, email, year, month, monthName } =
      data;
    return {
      AbsentDate: absentByDate[0],

      UserName: names[0],
      UserEmail: email[0],
      Year: year,
      Month: month,
      MonthName: getMonthName(monthName),
    };
  });

  const totalAbsent = attendanceByMonth.reduce(
    (acc, curr) => acc + curr.totatAbsent,
    0
  );
  const ouput = [...transformedData, { TotalAbsent: totalAbsent }];

  return ouput;
};

// FindOutTimeAttendaceByCurrentMonth("665aaf32f612041756a2800a").then(
//   (resulte) => {
//     console.log("result of promise ", resulte);
//   }
// );
const FindOutTimeAttendanceByMonthByUserid = async (
  UserId,
  year,
  month,
  numberOfDays
) => {
  const attendanceByMonth = await AttendanceModel.aggregate([
    {
      $match: {
        userid: new mongoose.Types.ObjectId(UserId), // Match by userid
      },
    },
    {
      $addFields: {
        attendanceYear: { $year: "$createdAt" },
        attendanceMonth: { $month: "$createdAt" },
        attendanceDay: { $dayOfMonth: "$createdAt" },
      },
    },
    {
      $match: {
        attendanceYear: year,
        attendanceMonth: month,
        attendanceDay: { $eq: numberOfDays }, // Filter by the requested number of days
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userid",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $group: {
        _id: {
          day: "$attendanceDay",
          status: "$status",
        },
        count: { $sum: 1 },
        name: { $first: "$userDetails.name" },
        email: { $first: "$userDetails.email" },
      },
    },
    {
      $group: {
        _id: "$_id.day",
        statuses: {
          $push: {
            status: "$_id.status",
            count: "$count",
          },
        },
        users: {
          $push: {
            name: "$name",
            email: "$email",
            status: "$_id.status",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        day: "$_id",
        statuses: 1,
        users: 1,
      },
    },
    {
      $sort: { day: 1 },
    },
  ]);

  const attendanceObj = {};
  attendanceByMonth.forEach((data) => {
    const { day, statuses, users } = data;
    const presentCount =
      statuses.find((s) => s.status === "present")?.count || 0;
    const absentCount = statuses.find((s) => s.status === "absent")?.count || 0;

    attendanceObj[day] = {
      present: presentCount,
      absent: absentCount,
      users: users.map((user) => ({
        name: user.name,
        email: user.email,
        status: user.status,
      })),
    };
  });
  // console.log("Attendance is: ", attendanceObj);
  return attendanceObj;
};

const FindOutTimeAttendanceByMonthByDays = async (
  userId,
  year,
  month,
  numberOfDays
) => {
  const attendanceByMonth = await AttendanceModel.aggregate([
    {
      $match: {
        userid: new mongoose.Types.ObjectId(userId), // Match by userid
      },
    },
    {
      $addFields: {
        attendanceYear: { $year: "$createdAt" },
        attendanceMonth: { $month: "$createdAt" },
        attendanceDay: { $dayOfMonth: "$createdAt" },
      },
    },
    {
      $match: {
        attendanceYear: year,
        attendanceMonth: month,
        attendanceDay: { $eq: numberOfDays }, // Filter by the requested number of days
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userid",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $group: {
        _id: {
          day: "$attendanceDay",
          status: "$status",
        },
        count: { $sum: 1 },
        name: { $first: "$userDetails.name" },
        email: { $first: "$userDetails.email" },
      },
    },
    {
      $group: {
        _id: "$_id.day",
        statuses: {
          $push: {
            status: "$_id.status",
            count: "$count",
          },
        },
        users: {
          $push: {
            name: "$name",
            email: "$email",
            status: "$_id.status",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        day: "$_id",
        statuses: 1,
        users: 1,
      },
    },
    {
      $sort: { day: 1 },
    },
  ]);

  const attendanceObj = {};
  attendanceByMonth.forEach((data) => {
    const { day, statuses, users } = data;
    const presentCount =
      statuses.find((s) => s.status === "present")?.count || 0;
    const absentCount = statuses.find((s) => s.status === "absent")?.count || 0;

    attendanceObj[day] = {
      present: presentCount,
      absent: absentCount,
      users: users.map((user) => ({
        name: user.name,
        email: user.email,
        status: user.status,
      })),
    };
  });
  // console.log("Attendance is: ", attendanceObj);
  return attendanceObj;
};

// // Sample call to the function
// const year = 2024;
// const month = 6;
// const numberOfDays = 7; // Assuming you want data for the first 10 days of the month
// FindOutTimeAttendanceByMonthByDays(
//   "66631c2abaa3652e4f50230c",
//   year,
//   month,
//   numberOfDays
// ).then((resulte) => {
//   console.log("resulte is ", resulte);
// });

// FindOutTimeAttendaceByMonth();

const FindOutTimeAttendaceByMonthName = async (monthName) => {
  monthName = monthName.toLowerCase();

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

  const monthNumber = Object.keys(monthNames).find(
    (key) => monthNames[key] === monthName
  );

  if (!monthNumber) {
    // console.log("Invalid month name");
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
        monthName: parseInt(monthNumber),
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        name: 1,
        email: 1,
        status: {
          $cond: {
            if: { $eq: [{ $size: "$attendance" }, 0] },
            then: "absent",
            else: {
              $cond: [
                {
                  $eq: [{ $arrayElemAt: ["$attendance.status", 0] }, "absent"],
                },
                "absent",
                "present",
              ],
            },
          },
        },
      },
    },
    {
      $match: {
        status: "absent", // Filter only the attendance records where the status is "absent"
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
        },
        AbsentByDate: 1,
        totalAbsent: 1,
        names: 1,
        email: 1,
      },
    },
  ]);

  return attendanceByMonth;
};

// FindOutTimeAttendaceByMonthName("may");

// console.log("process.env.GEO_API", process.env.GEO_API);

// takingLocation();

// findAttendanceByMonthName("march");

const findAdminAttendanceByMonthName = async (MonthName) => {
  let filter = {};
  if (!isNaN(monthNameOrYear)) {
    // If the parameter is a number, assume it's a year
    filter = {
      $expr: { $eq: [{ $year: "$Intime" }, parseInt(MonthName)] },
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
const FindOutTimeAttendanceByMonthByAdminOnly = async (UserID, year, month) => {
  const attendanceByMonth = await AttendanceModel.aggregate([
    {
      $match: {
        userid: new mongoose.Types.ObjectId(UserID),
      },
    },
    {
      $addFields: {
        attendanceYear: { $year: "$createdAt" },
        attendanceMonth: { $month: "$createdAt" },
        attendanceDate: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
      },
    },
    {
      $match: {
        attendanceYear: year,
        attendanceMonth: month,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userid",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          date: "$attendanceDate",
          status: "$status",
        },
        count: { $sum: 1 },
        name: { $first: "$userDetails.name" },
        email: { $first: "$userDetails.email" },
      },
    },
    {
      $group: {
        _id: "$_id.day",
        date: { $first: "$_id.date" },
        statuses: {
          $push: {
            status: "$_id.status",
            count: "$count",
          },
        },
        users: {
          $push: {
            name: "$name",
            email: "$email",
            status: "$_id.status",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        day: "$_id",
        date: 1,
        statuses: 1,
        users: 1,
      },
    },
    {
      $sort: { day: 1 },
    },
  ]);

  const attendanceObj = {};
  attendanceByMonth.forEach((data) => {
    const { day, date, statuses, users } = data;
    const presentCount =
      statuses.find((s) => s.status === "present")?.count || 0;
    const absentCount = statuses.find((s) => s.status === "absent")?.count || 0;

    attendanceObj[day] = {
      date: date,
      present: presentCount,
      absent: absentCount,
      users: users.map((user) => ({
        name: user.name,
        email: user.email,
        status: user.status,
      })),
    };
  });
  return attendanceObj;
};
const FindOutTimeAttendanceByMonthByAdminOnly2 = async (
  UserID,
  startDate,
  endDate
) => {
  try {
    const attendanceByMonth = await AttendanceModel.aggregate([
      {
        $match: {
          userid: new mongoose.Types.ObjectId(UserID),
          createdAt: {
            $gte: new Date(startDate), // Match documents with createdAt >= startDate
            $lte: new Date(endDate), // Match documents with createdAt <= endDate
          },
        },
      },
      {
        $addFields: {
          attendanceYear: { $year: "$createdAt" },
          attendanceMonth: { $month: "$createdAt" },
          attendanceDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            date: "$attendanceDate",
            status: "$status",
          },
          count: { $sum: 1 },
          name: { $first: "$userDetails.name" },
          email: { $first: "$userDetails.email" },
        },
      },
      {
        $group: {
          _id: "$_id.day",
          date: { $first: "$_id.date" },
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
          users: {
            $push: {
              name: "$name",
              email: "$email",
              status: "$_id.status",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          day: "$_id",
          date: 1,
          statuses: 1,
          users: 1,
        },
      },
      {
        $sort: { day: 1 },
      },
    ]);

    const attendanceObj = {};
    attendanceByMonth.forEach((data) => {
      const { day, date, statuses, users } = data;
      const presentCount =
        statuses.find((s) => s.status === "present")?.count || 0;
      const absentCount =
        statuses.find((s) => s.status === "absent")?.count || 0;

      attendanceObj[day] = {
        date: date,
        present: presentCount,
        absent: absentCount,
        users: users.map((user) => ({
          name: user.name,
          email: user.email,
          status: user.status,
        })),
      };
    });
    // console.log("data is ", attendanceObj);
    return attendanceObj;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw error;
  }
};

// Example usage:
// const UserID = "yourUserID";
// const startDate = "2024-05-10";
// const endDate = "2024-06-20";

// FindOutTimeAttendanceByMonthByAdminOnly2(startDate, endDate)
//   .then((attendance) => {
//     console.log("Attendance data:", attendance);
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });

module.exports = {
  TakeAttendance,
  FindAttendaceByMonth,
  findAttendanceByMonthName,
  OutTimeAttendance,
  FindOutTimeAttendaceByCurrentMonth,
  FindOutTimeAttendanceByMonthByDays,
  FindOutTimeAttendanceByMonthByUserid,
  TakingAttendanceMannual,
  FindOutTimeAttendaceByMonthName,
  findAllPresentUser,
  findALLAbsentUser,
  FindOutTimeAttendanceByMonthByAdminOnly,
  FindOutTimeAttendanceByMonthByAdminOnly2,
};
