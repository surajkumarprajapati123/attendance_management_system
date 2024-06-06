const mongoose = require("mongoose");

const DepartmentSchema = mongoose.Schema(
  {
    departmentName: {
      type: String,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

const DepartmentModel = mongoose.model("department", DepartmentSchema);

module.exports = DepartmentModel;
