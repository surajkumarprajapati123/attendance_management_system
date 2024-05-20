const { UserModel } = require("../models");
const { TokenService } = require("../service");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/ErrorHandler");

const Auth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.AccessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);
    if (!token) {
      throw new ErrorHandler("Unauthorized request", 401);
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await UserModel.findById(decodedToken?._id).select(
      "-password"
    );

    if (!user) {
      throw new ErrorHandler("Invalid Access Token", 401);
    }

    req.user = user;
    if (user.role === "admin") {
      res
        .status(401)
        .json({ message: " Unauthorized,Admin can't access this" });
    }
    // console.log("user form middleware", req.user);
    // console.log("middleare is controller is ", user);
    next();
  } catch (error) {
    // Step 5: Handle authentication error
    console.log(error);
    console.error("Authentication error:", error.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = Auth;
