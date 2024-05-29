const mongoose = require("mongoose");
const moment = require("moment");

const AttendanceSchema = mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    Intime: {
      type: Date,
      default: Date.now,
      // get: (val) => moment(val).format("DD/MM/YYYY"),
    },
    Outtime: {
      type: Date,
    },
    location: {
      type: String,
      default: "Noida",
    },
    status: {
      type: String,
      enum: ["absent", "present"],
      default: "absent",
    },
    istime: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Attendance = mongoose.model("attendance", AttendanceSchema);
module.exports = Attendance;
