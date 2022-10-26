const logger = require("../services/logger");
const ApiError = require("../errors/apiError");

const errorHandler = (err, res) => {
  let { message } = err;
  let statusCode = err.infos?.statusCode;

  if (!statusCode || Number.isNaN(Number(statusCode))) {
    statusCode = 500;
  }

  if (statusCode === 500) {
    logger.error(err);
  }

  if (res.get("Content-type")?.includes("html")) {
    res.status(statusCode).render("error", {
      statusCode,
      message,
      title: `Error ${err.statusCode}`,
    });
  } else {
    res.status(statusCode).json({
      status: "error",
      statusCode,
      message,
    });
  }
};

module.exports = {
  ApiError,
  errorHandler,
};
