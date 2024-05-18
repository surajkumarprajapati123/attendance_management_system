const mongoose = require("mongoose");

const AttendaceSchemca = mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    Intime: {
      type: Date,
      default: Date.now(),
    },
    Outtime: {
      type: Date,
      default: Date.now(),
    },
    location: {
      type: String,
      default: "Noida",
    },
  },
  { timestaps: true }
);

const attendance = mongoose.model("attendance", AttendaceSchemca);
module.exports = attendance;
