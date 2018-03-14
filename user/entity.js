var user = require('./user')
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

module.exports = { findAllUsers, findSpecificUser, deleteSpecificUser }