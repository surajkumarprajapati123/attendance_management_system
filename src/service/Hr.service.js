const { UserModel, UserNameModel, TokenModel } = require("../models");
const deleteFileFromCloudinary = require("../utils/DeleteUserAvatar");
const ErrorHandler = require("../utils/ErrorHandler");
const UploadfileOnCloudinary = require("../utils/cloudinary");
const { SendHrMailLeaveAppliation } = require("./EmailSend");
const {
  ApplyLeave,
  calculateDateDifference,
  updateApplicationByid,
} = require("./leave.service");

const HrUpdateWithIdService = async (hrid, userData) => {
  try {
    let user;
    const hr = await UserModel.findById(hrid);

    // Extract email and password from userData
    const { email, password, username, name, avatar, role } = userData;

    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(email)) {
      throw new ErrorHandler("Invalid Email", 400);
    }
    // Check if email is provided in the userData
    if (password) {
      throw new ErrorHandler("Password can't be changed", 400);
    }
    if (avatar) {
      throw new ErrorHandler("Avatar you can't  change ", 400);
    }
    if (role) {
      throw new ErrorHandler("You cant't change role", 400);
    }
    const AllUSer = await UserNameModel.find({ username: username });
    if (!AllUSer) {
      throw new ErrorHandler("User is not found for this username", 401);
    }
    // console.log("This is a all user", AllUSer);
    if (AllUSer.find((user) => user.username === username)) {
      throw new ErrorHandler(
        "Thise username is already use other user try other",
        401
      );
    }
    const updatedUserName = await UserNameModel.findOneAndUpdate(
      { userid: hrid },
      { $set: { username } },
      { new: true, upsert: true }
    );

    // If password is provided, hash it
    // if (password) {
    //   const hashedPassword = await bcrypt.hash(password, 10);
    //   updatedData.password = hashedPassword;
    // }
    // if (email) {
    //   user = await UserModel.findOneAndUpdate({ email });
    //   if (user) {
    //     user.email = email;
    //   } else {

    //   }
    // }

    // Find and update user by userId
    user = await UserModel.findByIdAndUpdate(adminid, userData, {
      new: true,
    });

    // Check if user exists
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }
    return user;
  } catch (error) {
    throw error;
  }
};

const getProfile = async (userid) => {
  const user = await UserModel.findById({ _id: userid }).select(
    "-password -_id -email"
  );
  // console.log(user);
  if (user.role !== "hr") {
    throw new ErrorHandler("Your are not Access this profile");
  }
  if (!user) {
    throw new ErrorHandler("User Not found", 400);
  }

  return user;
};
const changePassword = async (userid, userdata) => {
  const { oldPassword, newPassword } = userdata;
  if (!oldPassword || !newPassword) {
    throw new ErrorHandler("Old password and new password are required", 400);
  }
  if (!oldPassword) {
    throw new ErrorHandler("Enter the oldpassword", 400);
  }
  if (!newPassword) {
    throw new ErrorHandler("Enter the oldpassword", 400);
  }
  let user;
  user = await UserModel.findById({ _id: userid });
  //   console.log("user is system ", user);
  if (user.role !== "hr") {
    throw new ErrorHandler(
      "You are not authorized to change the password",
      401
    );
  }
  if (!user) {
    throw new ErrorHandler("User is not found", 400);
  }

  const newoldpassword = await user.comparePassword(oldPassword);

  if (!newoldpassword) {
    throw new ErrorHandler("old password is not match", 400);
  }
  user.password = newPassword; // Assuming you have logic to hash newPassword before saving

  // Save the updated user object
  await user.save();
  const response = {
    name: user.name,
    username: user.username,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    __v: user.__v,
  };

  return response;
};
// const somdata = {
//   oldPassword: "password1",
//   newPassword: "password",
// };
// changePassword("66482adfe6e69f140a372dc6", somdata)
//   .then((updatedUser) => {
//     console.log("Password changed successfully:", updatedUser);
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });

const UpdatedHrAvatar = async (req, userId) => {
  try {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
      throw new ErrorHandler("Avatar file is missing", 400);
    }

    const newAvatar = await UploadfileOnCloudinary(avatarLocalPath);

    if (!newAvatar.url) {
      throw new ErrorHandler("Error while uploading avatar", 400);
    }

    // Get the user document and extract the previous avatar URL
    const user = await UserModel.findById(userId);
    // console.log("user is updatng show ", user);
    const previousAvatarUrl = user.avatar;

    // Delete previous avatar image from Cloudinary
    if (previousAvatarUrl) {
      await deleteFileFromCloudinary(previousAvatarUrl);
    }

    // Update user document with new avatar URL
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { avatar: newAvatar.url } },
      { new: true }
    ).select("-password -email");

    //   console.log("Updated user:", updatedUser);

    return updatedUser;
  } catch (error) {
    console.error("Error updating avatar:", error);
    throw error;
  }
};

const Logoutuser = async (userid) => {
  const user = await TokenModel.findByIdAndUpdate(
    userid,
    {
      $unset: {
        token: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );
  const useridmodel = await UserModel.findById(userid);
  // console.log("user model is ", useridmodel);
  if (useridmodel.role !== "hr") {
    throw new ErrorHandler("Your are not authorized", 401);
  }
  // console.log("log out user is ", user);
  if (!user) {
    throw new ErrorHandler("Login first", 401);
  }
  // console.log("user logout is ", user);
  return user;
};

const ApplyLeaveHr = async (userid, usedate) => {
  const { startDate, endDate, reason } = usedate;
  const totalleave = calculateDateDifference(startDate, endDate);
  // console.log("tootal leave is ");
  const FindhrId = await UserModel.findById(userid);
  // console.log("user id is ", FindhrId);
  const FindAdmin = await UserModel.findOne({ role: "admin" });
  // console.log("admin data is ", FindAdmin);
  const adminEmail = FindAdmin.email;
  if (FindhrId.role !== "hr") {
    throw new ErrorHandler(
      "You are not authorized apply application leave Applicaiton ",
      401
    );
  }
  const apply = await ApplyLeave(userid, usedate);
  //   console.log("admin data is ", FindAdmin);
  await SendHrMailLeaveAppliation(
    adminEmail,
    FindhrId.username,
    apply.application_no,
    apply.startDate,
    apply.endDate,
    totalleave
  );
  console.log("apply is ", apply);
  return apply;
};

// const RjectLeaveHr = async (userid, usedate) => {
//     const { startDate, endDate, reason } = usedate;
//     const totalleave = calculateDateDifference(startDate, endDate);
//   const FindhrId = await UserModel.findById(userid);
//   console.log("user id is ", FindhrId);
//   const FindAdmin = await UserModel.findOne({ role: "admin" });
//   console.log("admin data is ", FindAdmin);
//   const adminEmail = FindAdmin.email;
//   if (FindhrId.role !== "hr") {
//     throw new ErrorHandler(
//       "You are not authorized apply application leave Applicaiton ",
//       401
//     );
//   }
//   const apply = await ApplyLeave(userid, usedate);
// //   console.log("admin data is ", FindAdmin);
//   await  SendHrMailLeaveAppliation(adminEmail,FindhrId.username,apply.application_no,apply.startDate,apply.endDate,totalleave)
//   console.log("apply is ", apply);
//   return apply
// };
const userdata = {
  startDate: "24/02/2024",
  endDate: "28/02/2024",
  reason: "important work at home",
};
const SearchbyApplicationNumber = async (Serachdata) => {
  const user = await LeaveModel.find({
    application_no: { $regex: Serachdata, $options: "i" },
  }).select("-_id");

  // console.log("Search user is ", user);
  if (!user) {
    throw new ErrorHandler(
      `User is not found for This applicaiton ${application_no}`
    );
  }
  return user;
};

try {
  //   ApplyLeaveHr("66482adfe6e69f140a372dc6", userdata);
} catch (error) {
  console.log(error);
}

const updateLeaveApplication = async (userid, userdata) => {
  let user;
  user = await UserModel.findById(userid);
  if (user.role !== "hr") {
    throw new ErrorHandler(
      "You are not authorized apply application leave Applicaiton",
      401
    );
  }
  user = await updateApplicationByid(userid, userdata);

  return user;
};
module.exports = {
  HrUpdateWithIdService,
  getProfile,
  changePassword,
  UpdatedHrAvatar,
  Logoutuser,
  updateLeaveApplication,
  ApplyLeaveHr,
  SearchbyApplicationNumber,
};
