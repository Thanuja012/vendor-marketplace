const response = {
  success: (res, data = {}, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, data });
  },
  error: (res, message = 'Something went wrong', statusCode = 500) => {
    return res.status(statusCode).json({ success: false, message });
  },
  paginated: (res, data, pagination) => {
    return res.status(200).json({ success: true, data, pagination });
  },
};

module.exports = response;
