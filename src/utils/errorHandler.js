const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: err.errors,
      });
    }
  
    if (err.name === "CastError" && err.kind === "ObjectId") {
      return res.status(400).json({
        message: `Invalid ID format: ${err.value}`,
      });
    }
  
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate value error",
        details: err.keyValue,
      });
    }
  
    if (err.message === "Access denied. Admin privileges required") {
      return res.status(403).json({
        message: err.message,
      });
    }
  
    return res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
    });
  };
  
  export { errorHandler };
  