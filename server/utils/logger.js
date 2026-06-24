function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO";
    if (level !== "INFO" || req.path !== "/api/health") {
      console.log(`[${level}] ${req.method} ${req.path} ${status} ${ms}ms`);
    }
  });
  next();
}

module.exports = requestLogger;
