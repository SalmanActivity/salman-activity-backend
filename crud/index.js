let getUtil = require('./get')
let deleteUtil = require('./delete')

module.exports = {
    getFetchConvertFilter: getUtil.getFetchConvertFilter,
    getOneFetchConvertFilter: getUtil.getOneFetchConvertFilter,
    fields: getUtil.fields,
    deleteFindDelete: deleteUtil.deleteFindDelete
}