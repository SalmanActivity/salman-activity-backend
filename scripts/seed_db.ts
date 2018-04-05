import * as mongoose from 'mongoose'
import config from '../config'
import * as models from '../seed'
import { Item, Accessor } from '../accessor'

let debug = require('debug')('salman-activity-server:seed')

async function runSeeder() {
  await mongoose.connect(config.mongoConnection)
  debug('connected to mongo server')
  
  debug('deleting all documents')
  for (let model in models)
    await models[model].accessor.deleteAll()

  debug('inserting documents')
  for (let model in models) {
    let currentModel = models[model]
    let accessor: Accessor<Item> = currentModel.accessor
    let documents: Item[] = currentModel.documents
    for (let doc of documents)
      await accessor.insert(doc)
  }
}

runSeeder()
.then(() => {
  debug('success seeding database')
  if (!module.parent) {
    debug("exiting...")
    process.exit()
  }
})
.catch(err => {
  debug('some error occured', err)
})