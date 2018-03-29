module.exports = {
  login: require('./login'),
  user: require('./auth').user,
  auth: require('./auth').auth,
  roles: require('./roles'),
  admin: require('./roles').admin
}