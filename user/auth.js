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

    let successCallback = (user) => {
        req.user = user
        next()
    }
    let failedCallback = () => {
        res.status(403).json({
            error: {
                msg: 'cannot perform action',
                cause: 'unauthorized access'
            }
        })
    }

    if (token)
        jwt.verify(token, config.secretKey, function(err, data) {
            if (err)
                failedCallback()    
            else
                user.findOne({username}).exec()
                    .then(successCallback, failedCallback)
        })
    else
        failedCallback()
}

module.exports = { login, auth }