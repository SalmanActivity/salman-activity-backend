let getUtil = require('./get')
let deleteUtil = require('./delete')
let postUtil = require('./post')
var putUtil = require('./put')
let crudUtil = require('./util')

module.exports = {
  fields: getUtil.fields,
  postValidateFindInsertConvert: postUtil.postValidateFindInsertConvert,
    
  createOne: postUtil.createOne,
  readOne: getUtil.readOne,
  readMany: getUtil.readMany,
  updateOne: putUtil.updateOne,
  deleteOne: deleteUtil.deleteOne,
  filterOne: {
    fields: crudUtil.simpleFilterFieldOne
  }
}