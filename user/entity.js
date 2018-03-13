var user = require('./user')
var schemaUtil = require('../util/schemaUtil')

const publicAttr = ['id', 'name', 'username', 'division', 'enabled', 'admin']

function findAllUsers(req, res, next) {
    return user.find().then(users => {
        users = users.map(val => val.toJSON())

        // admin can see them all, division just its division
        if (!req.user.admin) {
            let result = []
            for (let user of users)
                try {
                    currDivId = req.user.division.id
                    userDivId = user.division.id
                    if (currDivId == userDivId)
                        result.push(user)
                } catch (e) {
                    if (user.id == req.user.id)
                        result.push(user)
                }
            users = result
        }

        res.json(schemaUtil.fillObjectFields(publicAttr, users))
    })
}

module.exports = { findAllUsers }