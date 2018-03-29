var debug = require('debug')('crud-debug')

function displayError(res, errorMessage) {
  return (err) => {
    debug(err)
    if (!err.status)
      err = {status: 500, cause: 'internal server error'}

    res.status(err.status).json({
      error: {
        msg: errorMessage,
        cause: err.cause
      }
    })
  }
}

module.exports = { displayError }