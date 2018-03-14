var bluebird = require('bluebird')
var user = bluebird.promisifyAll(require('./user'))
var division = bluebird.promisifyAll(require('../division/division'))
var ObjectId = require('mongoose').Types.ObjectId
var schemaUtil = require('../util/schemaUtil')

function filterUserByRole(user, userObject) {
    const publicAttr = ['id', 'name', 'username', 'division', 'enabled', 'admin']

    if (userObject instanceof Array) {
        let resultArray = []
        for (let i = 0; i < userObject.length; i++) {
            let userFiltered = filterUserByRole(user, userObject[i])
            if (userFiltered)
                resultArray.push(userFiltered)
        }
        return resultArray
    }
    
    if (userObject && typeof userObject === 'object') {
        if (userObject.toJSON)
            userObject = userObject.toJSON()
        if (user.id != userObject.id && !user.admin)
            try {
                currDivId = user.division.id
                userDivId = userObject.division.id
                if (currDivId == userDivId)
                    return schemaUtil.fillObjectFields(publicAttr, userObject)
                throw 'different division'
            } catch (e) {
                return null
            }
        return schemaUtil.fillObjectFields(publicAttr, userObject)
    }

    return null
}

function findAllUsers(req, res, next) {
    return user.find().exec().then(users => {
        users = users.map(val => val.toJSON())
        res.json(filterUserByRole(req.user, users))
    })
}

function getUserObjectId(userId) {
    return new Promise((resolve, reject) => {
        try {
            resolve(new ObjectId(userId))
        } catch(e) {
            resolve(new ObjectId('000000000000000000000000'))
        }
    })
}

function findSpecificUser(req, res, next) {
    return userObjectId(req.params.userId)
    .then(_id => user.findOne({_id}).exec())
    .then(user => {
        user = filterUserByRole(req.user, user)
        if (user)
            res.json(user)
        else
            res.status(404).json({
                msg: 'cannot retrieve specific user',
                cause: 'user not found'
            })
    })
    .catch(err => res.status(500).json({
        msg: 'cannot retrieve specific user',
        cause: 'internal server error'
    }))
}

function deleteSpecificUser(req, res, next) {
    return getUserObjectId(req.params.userId)
    .then(_id => user.findOne({_id}).exec())
    .then(user => {
        if (user) {
            user.enabled = false
            return user.save()
        } else
            return Promise.reject('USER_NOT_FOUND')
    })
    .then(user => {
        res.status(202).json(user)
    })
    .catch(err => {
        if (err === 'USER_NOT_FOUND')
            res.status(404).json({
                msg: 'cannot delete specific user',
                cause: 'user not found'
            })
        else
            res.status(500).json({
                msg: 'cannot delete specific user',
                cause: 'internal server error'
            })
    })
}

function createNewUser(req, res, next) {
    return new Promise((resolve, reject) => {
        let obj = schemaUtil.fillObjectFields(['name','username','email','password','division','admin'], req.body)
        if (!obj.username || !obj.email)
            reject({status: 500, cause: 'undefined username and email'})
        
        if (obj.division)
            division.findOneAsync({_id:obj.division}).then(div => {
                if (div) {
                    obj.division = div
                    resolve(obj)
                } else
                    reject(({status: 404, cause: 'division not found'}))
            })
        else
            resolve(obj)
    })
    .then(val => {
        return bluebird.promisify(async.parallel)([
            cb => cb.bind(this, null, val),
            cb => division.findOne({username:val.username}, cb),
            cb => division.findOne({email:val.email}, cb)
        ])
    })
    .then(res => {
        let cause = []
        if (res[1])
            cause.push('username already taken')
        if (res[2])
            cause.push('email already taken')
        
        if (cause.length > 0)
            return Promise.reject({status:500, cause})
        return Promise.resolve(res[0])
    })
    .then(val => user.insertAsync(new userSchema(val)))
    .then(val => {
        if (val)
            return res.status(201).json(val.toJSON())
        else
            return Promise.reject({status:500, cause:'internal server error'})
    })
    .catch(err => {
        console.log(err)
        if (!err.status)
            err = {status: 500, cause: 'internal server error'}
        res.status(err.status).json({
            error: {
                msg: 'cannot insert new user',
                cause: err.cause
            }
        })
    })
}

module.exports = { findAllUsers, findSpecificUser, deleteSpecificUser, createNewUser }