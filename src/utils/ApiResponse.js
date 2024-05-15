const ApiResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: (statusCode >= 200 && statusCode < 300) || "Valid Responce Code",
    message,
    data,
  });
};
module.exports = ApiResponse;
