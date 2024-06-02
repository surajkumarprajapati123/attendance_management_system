const mongoose = require("mongoose");

const LeaveTypeSchema = new mongoose.Schema(
  {
    // Different types of leave with default max days allowed
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    sickLeave: {
      type: Number,
      default: 10,
    },
    casualLeave: {
      type: Number,
      default: 12,
    },
    parentalLeave: {
      type: Number,
      default: 15,
    },
    maternityLeave: {
      type: Number,
      default: 15,
    },
    paternityLeave: {
      type: Number,
      default: 15,
    },
    compensatoryLeave: {
      type: Number,
      default: 12,
    },
    bereavementLeave: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

const LeaveType = mongoose.model("LeaveType", LeaveTypeSchema);

module.exports = LeaveType;
