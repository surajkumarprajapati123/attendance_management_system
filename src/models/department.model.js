const mongoose = require("mongoose");

const DepartmentSchema = mongoose.Schema({}, { timestamps: true });

const DepartmentModel = mongoose.model("department", DepartmentSchema);

module.exports = DepartmentModel;
