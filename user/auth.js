var util = require('util')
var passwordHash = require('password-hash')
var jwt = require('jsonwebtoken')
var config = require('../config')
var user = require('./user')

function login(req, res, next) {
    let username = undefined
    let password = undefined

    return new Promise((resolve, reject) => {
        if (req.body.username && req.body.password) {
            username = req.body.username
            password = req.body.password
            resolve()
        } else {
            res.status(401)
            reject('empty username or password')
        }
    }).then(() => {
        return user.findOne({username}).exec()
            .then(userDocument => userDocument)
            .catch(error => Promise.reject('internal server error'))
    }).then((userDocument) => {
        if (userDocument && userDocument.enabled && passwordHash.verify(password, userDocument.password))
            return {
                name: userDocument.name,
                username: userDocument.username
            }
        else {
            res.status(403)
            return Promise.reject('wrong username or password')
        }
    }).then(payload => {
        let token = jwt.sign(payload, config.secretKey)
        return res.header('Authorization', 'JWT ' + token).status(200).json({token})
    }).catch((error) => {
        res.json({
            error: {
                msg: 'login failed',
                cause: error
            }
        })
    })
}

function auth(req, res, next) {
    let token = undefined
    if (req.body.token)
        token = req.body.token
    if (req.header('Authorization')) {
        let tokenHeader = req.header('Authorization')
        let tokenArr = tokenHeader.split(' ')
        if (tokenArr.length == 2 && tokenArr[0].toLowerCase() == 'jwt')
            token = tokenArr[1]
    }
    req.token = token

    return new Promise((resolve, reject) => {
        if (token)
            resolve(token)
        else
            reject()
    })
    .then(token => util.promisify(jwt.verify)(token, config.secretKey))
    .then(data => user.findOne({username: data.username}).exec())
    .then(user => {
        req.user = user.toJSON ? user.toJSON() : user
        return req.user
    })
    .then(() => next())
    .catch((err) => {
        res.status(403).json({
            error: {
                msg: 'cannot perform action',
                cause: 'unauthorized access'
            }
        })
    })
}

function admin(req, res, next) {
    return new Promise((resolve, reject) => {
        if (req.user && req.user.admin)
            resolve()
        else
            rejet()
    })
    .then(() => next())
    .catch(() => {
        res.status(403).json({
            error: {
                msg: 'only admin can perform this action',
                cause: 'unauthorized access'
            }
        })
    })
}

module.exports = { login, auth, admin }
