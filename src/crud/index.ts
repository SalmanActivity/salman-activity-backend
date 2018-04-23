export { readOne, readMany } from './get';
export { createOne } from './post';
export { deleteOne } from './delete';
export { updateOne } from './put';

import { simpleFilterFieldOne } from './util';

export let filterOne = {
  fields: simpleFilterFieldOne
};