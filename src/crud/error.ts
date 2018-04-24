const debug = require('debug')('salman-activity-backend:debug');

/**
 * Fungsi ini mengembalikan fungsi untuk mengirimkan error sebagai response endpoint.
 * Fungsi yang dihasilkan memiliki satu buah parameter yang berisi error status dan error cause.
 * Fungsi yang dihasilkan akan memberikan response berupa json yang berisi error message, error status
 * dan error cause.
 * @param res response object untuk memberikan response dari suatu endpoint.
 * @param errorMessage pesan error yang ingin dikirimkan sebagai response.
 */
export function displayError(res, errorMessage:string) {
  return (err) => {
    debug(err);
    if (!err.status) {
      err = {status: 500, cause: 'internal server error.'};
    }

    if (err.cause instanceof Error) {
      err.cause = err.cause.message;
    }

    res.status(err.status).json({
      error: {
        msg: errorMessage,
        cause: err.cause
      }
    });
  };
}