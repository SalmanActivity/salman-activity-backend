import * as mongoose from 'mongoose';
import config from '../config';
import * as models from '../seed';
import { Item, Accessor } from '../accessor';

const debug = require('debug')('salman-activity-backend:seed');

async function runSeeder() {
  await mongoose.connect(config.mongoConnection);
  debug('connected to mongo server');
  
  debug('deleting all documents');
  for (const model in models) {
    if (models.hasOwnProperty(model)) {
      await models[model].accessor.deleteAll();
    }
  }

  debug('inserting documents');
  for (const model in models) {
    if (models.hasOwnProperty(model)) {
      const currentModel = models[model];
      const accessor: Accessor<Item> = currentModel.accessor;
      const documents: Item[] = currentModel.documents;
      for (const doc of documents) {
        await accessor.insert(doc);
      }
    }
  }
}

runSeeder()
.then(() => {
  debug('success seeding database');
  if (!module.parent) {
    debug("exiting...");
    process.exit();
  }
})
.catch(err => {
  debug('some error occured', err);
  process.exit();
});