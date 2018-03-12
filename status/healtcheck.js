module.exports = function(req, res, next) {
  res.json({
    status: 'success',
    success: true,
    data: 'up and running'
  })
};