const mongoose = require("mongoose");

const OtpSchema = mongoose.Schema(
  {
    email: {
      type: String,
    },
    otp: {
      type: String,
    },
  },
  { timestemps: true }
);

const otp = mongoose.model("otp", OtpSchema);
module.exports = otp;
