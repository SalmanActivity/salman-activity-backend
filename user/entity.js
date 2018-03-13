var user = require('./user')
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
    
    if (typeof userObject === 'object') {
        if (user.id != userObject.id && !user.admin)
            try {
                currDivId = user.division.id
                userDivId = userObject.division.id
                return schemaUtil.fillObjectFields(publicAttr,userObject)
            } catch (e) {
                return null
            }
        return userObject
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
    return user.findOne({id:req.query.id}).exec()
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

module.exports = { findAllUsers, findSpecificUser }