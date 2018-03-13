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

function findSpecificUser(req, res, next) {
    return new Promise((resolve, reject) => {
        try {
            resolve(new ObjectId(req.params.userId))
        } catch(e) {
            resolve(new ObjectId('000000000000000000000000'))
        }
    })
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
    .catch(err => {
        console.log(err)
        res.status(500).json({
            msg: 'cannot retrieve specific user',
            cause: 'internal server error',err
        })
    })
}

function deleteSpecificUser(req, res, next) {
    // user.deleteOne({id: })
}

module.exports = { findAllUsers, findSpecificUser }