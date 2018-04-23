const debug = require('debug')('salman-activity-backend:debug');

export function displayError(res:any, errorMessage:any):any {
  return (err) => {
    debug(err);
    if (!err.status) {
      err = {status: 500, cause: 'internal server error.'};
    }

    res.status(err.status).json({
      error: {
        msg: errorMessage,
        cause: err.cause
      }
    });
  };
}