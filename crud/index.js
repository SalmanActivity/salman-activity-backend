let getUtil = require('./get')
let deleteUtil = require('./delete')
let postUtil = require('./post')
let crudUtil = require('./util')

module.exports = {
    fields: getUtil.fields,
    deleteFindDelete: deleteUtil.deleteFindDelete,
    postValidateFindInsertConvert: postUtil.postValidateFindInsertConvert,

    readOne: getUtil.readOne,
    readMany: getUtil.readMany,
    filterOne: {
        fields: crudUtil.simpleFilterFieldOne
    }
}