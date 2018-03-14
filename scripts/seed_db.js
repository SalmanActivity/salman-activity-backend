var mongoose = require('mongoose')
var debug = require('debug')('salman-activity-backend:server')
var config = require('../config')
var documents = require('../seed')

mongoose.connect(config.mongoConnection).then(resp => {
  debug('connected to mongo server')
})
.then(() => {
  debug('deleting all models')
  let models = mongoose.modelNames()
  let remaining = models.length
  return new Promise((resolve, reject) => {
    for (let model of models)
      mongoose.model(model).remove({}, err => {
        if (err)
          reject(err)
        else {
          remaining--
          if (remaining <= 0)
            resolve()
        }
      })
  })
})
.then(() => {
  debug('inserting documents')
  return new Promise((resolve, reject) => {
    let remaining = documents.length
    for (let entity of documents)
      entity.save(err => {
        if (err)
          reject(err)
        else {
          remaining--;
          if (remaining <= 0)
            resolve()
        }
      })
  })
})
.then(() => {
  debug('success seeding database')
  mongoose.disconnect()
  process.exit()
})
.catch(error => {
  debug('error occured', error)
  process.exit()
})