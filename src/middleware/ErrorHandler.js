const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server Error";

  // wrong mongodb id error
  if (err.name === "CastError") {
    const message = `Resources not found with this id.. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }
  // token error
  if (err.name === "ErrorHandler") {
    const message = `Resources not found with this id.. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate key ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // wrong jwt error
  if (err.name === "JsonWebTokenError") {
    const message = `Your url is invalid please try again letter`;
    err = new ErrorHandler(message, 400);
  }

  // jwt expired
  if (err.name === "TokenExpiredError") {
    const message = `Your Url is expired please try again letter!`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};

// const httpStatus = require("http-status");
// const errorHandler = (err, req, res, next) => {
//   let { statusCode, message } = err;
//   if (process.env.NODE_ENV === "production" && !err.isOperational) {
//     statusCode = httpStatus.INTERNAL_SERVER_ERROR;
//     message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
//   }

//   res.locals.errorMessage = err.message;

//   const response = {
//     code: statusCode,
//     message,
//     ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
//   };

//   if (process.env.NODE_ENV === "development") {
//     logger.error(err);
//   }

//   res.status(statusCode).send(response);
// };

// module.exports = {
//   errorHandler,
// };
