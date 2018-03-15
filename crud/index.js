let getUtil = require('./get')
let deleteUtil = require('./delete')
let postUtil = require('./post')
let crudUtil = require('./util')

module.exports = {
    fields: getUtil.fields,
    postValidateFindInsertConvert: postUtil.postValidateFindInsertConvert,
    
    createOne: postUtil.createOne,
    readOne: getUtil.readOne,
    readMany: getUtil.readMany,
    deleteOne: deleteUtil.deleteOne,
    filterOne: {
        fields: crudUtil.simpleFilterFieldOne
    }
}