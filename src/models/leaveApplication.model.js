const mongoose = require("mongoose");

const leaveApplicationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    application_no: {
      type: String,
      default: "12345",
    },
    block: {
      type: Boolean,
      default: false,
    },
    DateAndtime: {
      type: Date,
      default: Date.now(),
    },
    days: {
      type: String,
    },

    leaveType: {
      type: String,
      enum: [
        "sickLeave",
        "casualLeave",
        "parentalLeave",
        "maternityLeave",
        "paternityLeave",
        "compensatoryLeave",
        "bereavementLeave",
      ],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    departmentName: {
      type: String,
    },
  },
  { timestamps: true }
);

const LeaveApplication = mongoose.model(
  "LeaveApplication",
  leaveApplicationSchema
);

module.exports = LeaveApplication;

// const mongoose = require("mongoose");

// const LeaveSchema = mongoose.Schema({
//   userid: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "user",
//     required: true,
//   },
//   applyDate: {
//     type: Date,
//     required: true,
//   },
//   dayRange: [
//     {
//       type: Date,
//     },
//   ],
//   leaveType: {
//     type: String,
//     required: true,
//   },
//   noOfDays: {
//     type: Number,
//     required: true,
//   },
//   reason: {
//     type: String,
//   },
//   isVacation: {
//     type: Boolean,
//     default: false,
//   },
//   address: {
//     type: String,
//     default: "",
//   },
//   document: {
//     type: String,
//     default: "",
//   },
// });

// const Leave = mongoose.model("Leave", LeaveSchema);
// module.exports = Leave;
