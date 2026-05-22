'use strict';

exports.sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, ...data });
};

exports.sendCreated = (res, data) => {
  exports.sendSuccess(res, data, 201);
};
