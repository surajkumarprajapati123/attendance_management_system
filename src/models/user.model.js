const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter the User Name"],
    },
    email: {
      type: String,
      required: [true, "Please Enter the email"],
      validate: {
        validator: function (v) {
          // Regular expression for email validation
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    password: {
      type: String,
    },
    username: {
      type: String,
    },
    phone: {
      type: String,
      default: "1234",
    },
    avatar: {
      type: String,
      default:
        "https://img.freepik.com/free-photo/image-3d-ganesha-dark-background-diwali_125540-3629.jpg",
    },
    role: {
      type: String,
      default: "employee",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});
UserSchema.methods.comparePassword = async function (password) {
  const ismatch = await bcrypt.compare(password, this.password);
  // console.log("Password is from databse  ", ismatch);
  return ismatch;
};

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      // email: this.email,
      // username: this.username,
      // fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
const user = mongoose.model("user", UserSchema);
module.exports = user;
