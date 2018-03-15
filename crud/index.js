let getUtil = require('./get')
let deleteUtil = require('./delete')
let postUtil = require('./post')

module.exports = {
    getFetchConvertFilter: getUtil.getFetchConvertFilter,
    getOneFetchConvertFilter: getUtil.getOneFetchConvertFilter,
    fields: getUtil.fields,
    deleteFindDelete: deleteUtil.deleteFindDelete,
    postValidateFindInsertConvert: postUtil.postValidateFindInsertConvert
}