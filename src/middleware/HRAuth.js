const jwt = require("jsonwebtoken");

const { UserModel } = require("../models");
const ErrorHandler = require("../utils/ErrorHandler");

const AdminAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.AccessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);
    if (!token) {
      res.status(401).json({
        message: "Unauthorized request",
      });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await UserModel.findById(decodedToken?._id).select(
      "-password"
    );

    if (!user) {
      throw new ErrorHandler("Invalid Access Token", 401);
    }

    req.user = user;
    // console.log("user form middleware", req.user);

    // console.log("user", user.role);
    // Check if the user is an admin
    if (user.role !== "hr") {
      return res
        .status(403)
        .json({ message: "Unauthorized access, hr privileges required" });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Log the error
    console.error("Authentication error:", error);

    // Handle different types of errors
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    } else if (error instanceof ErrorHandler) {
      return res.status(error.statusCode).json({ message: error.message });
    } else {
      // Other unexpected errors
      console.error("Unexpected error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = AdminAuth;
