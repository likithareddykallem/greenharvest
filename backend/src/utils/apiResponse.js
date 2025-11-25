// backend/src/utils/apiResponse.js

const buildMeta = (meta) => (meta ? { meta } : {});

const success = (res, data, message = 'OK', status = 200, meta) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    ...buildMeta(meta),
  });
};

const created = (res, data, message = 'Created', meta) => success(res, data, message, 201, meta);

const error = (res, message, status = 500, errors) => {
  return res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

module.exports = {
  success,
  created,
  error,
};

