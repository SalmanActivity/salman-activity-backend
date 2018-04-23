import { displayError } from './error';
import * as crudUtil from './util';

export function readMany(option) {
  const requiredFunctions = ['init','fetchMany','convertMany','filterMany','filterFieldMany'];
  const {init,fetchMany,convertMany,filterMany,filterFieldMany} = crudUtil.fetchOptionFunctions(option, requiredFunctions);

  return async (req, res, next) => {
    const context = {};
    try {
      let object:any = await init(req, context);
      object = await fetchMany(object, context);
      object = await convertMany(object, context);
      object = await filterMany(object, context);
      object = await filterFieldMany(object, context);
      res.status(200).json(object);
    } catch (err) {
      displayError(res, 'cannot fetch objects')(err);
    }
  };
}

export function readOne(option) {
  const requiredFunctions = ['init','fetchOne','convertOne','filterOne','filterFieldOne'];
  const {init,fetchOne,convertOne,filterOne,filterFieldOne} = crudUtil.fetchOptionFunctions(option, requiredFunctions);

  return async (req, res, next) => {
    try {
      const context = {};
      let object:any = await init(req, context);
      object = await fetchOne(object, context);

      if (object) {
        object = await convertOne(object, context);
      }
      else {
        throw {status:404, cause: 'object not found'};
      }
      
      if (object) {
        object = await filterOne(object, context);
      }
      else {
        throw {status:404, cause: 'object not found'};
      }
    
      if (object) {
        object = await filterFieldOne(object, context);
      }
      else {
        throw {status:404, cause: 'object not found'};
      }

      res.status(200).json(object);
    } catch (err) {
      displayError(res, 'cannot fetch specific object')(err);
    }
  };
}
