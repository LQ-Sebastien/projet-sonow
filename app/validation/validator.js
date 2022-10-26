const { ApiError } = require("../services/errorHandler");

module.exports = (prop, schema) => async (request, _, next) => {
  try {
    await schema.validateAsync(request[prop]);
    next();
  } catch (error) {
    next(new ApiError(error.details[0].message, { statusCode: 400 }));
  }
};
