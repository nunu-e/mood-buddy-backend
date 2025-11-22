const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error("Error:", err);

  if (err.name === "CastError") {
    const message = "Resource not found";
    error = {
      success: false,
      message,
      statusCode: 404,
    };
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' is already taken`;
    error = {
      success: false,
      message,
      statusCode: 400,
    };
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = {
      success: false,
      message: "Validation failed",
      errors: messages,
      statusCode: 400,
    };
  }

  if (err.name === "JsonWebTokenError") {
    error = {
      success: false,
      message: "Invalid token",
      statusCode: 401,
    };
  }

  if (err.name === "TokenExpiredError") {
    error = {
      success: false,
      message: "Token expired",
      statusCode: 401,
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(error.errors && { errors: error.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
