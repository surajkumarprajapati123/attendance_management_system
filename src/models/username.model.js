const mongoose = require("mongoose");

const UserNameScheam = mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    username: {
      type: String,
    },
  },
  { timestemps: true }
);

const Username = mongoose.model("username", UserNameScheam);
module.exports = Username;
