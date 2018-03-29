function admin(req, res, next) {
  return new Promise((resolve, reject) => {
    if (req.user && req.user.admin)
      resolve(next())
    else
      rejet()
  })
  .catch(() => {
    res.status(403).json({
      error: {
        msg: 'only admin can perform this action',
        cause: 'unauthorized access'
      }
    })
  })
}

module.exports = {
  admin
}