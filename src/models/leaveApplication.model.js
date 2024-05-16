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
  },
  { timestamps: true }
);

const LeaveApplication = mongoose.model(
  "LeaveApplication",
  leaveApplicationSchema
);

module.exports = LeaveApplication;
