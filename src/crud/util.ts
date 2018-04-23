import * as async from 'async';
import * as util from 'util';

export function oneToManyFunction(oneFunction) {
  return async function(valArr, context):Promise<any[]> {
    const parallelArr = valArr.map(val => oneFunction(val, context));
    const results = await Promise.all(parallelArr);
    const resultArr = [];
    for (let i = 0; i < valArr.length; i++) {
      if (results[i]) {
        resultArr.push(results[i]);
      }
    }
    return resultArr;
  };
}

export function manyToOneFunction(manyFunction) {
  return async function(result, context):Promise<any> {
    const res = await manyFunction([result], context);
    return result && result.length > 0 ? result[0] : null;
  };
}

export function simpleFilterFieldOne(fieldArr) {
  return async function(obj, context):Promise<any> {
    const newObj = {};

    for (const key of fieldArr) {
      const paths = key.split('.');
      let newObjRecurse = newObj;
      let objRecurse = obj;
      let exists = true;
      for (const idx of paths.slice(0,-1)) {
        if (!objRecurse || !(idx in objRecurse)) {
          exists = false;
          break;
        }
        objRecurse = objRecurse[idx];

        if (!(idx in newObjRecurse)) {
          newObjRecurse[idx] = {};
        }
        newObjRecurse = newObjRecurse[idx];
      }
      if (!exists) {
        continue;
      }
      const localKey = paths[paths.length - 1];
      if (objRecurse && localKey in objRecurse) {
        newObjRecurse[localKey] = objRecurse[localKey];
      }
    }

    return newObj;
  };
}

export function defaultFunction(func) {
  const init = async (req, context) => req;

  const deleteOne = async (item, context) => item;

  const fetchOne = async (item, context) => item;

  const filterOne = async (item, context) => item;

  const convertOne = async (item, context) => item;

  const filterFieldOne = async (item, context) => item;

  const deleteMany = oneToManyFunction(deleteOne); 

  const fetchMany = oneToManyFunction(fetchOne);

  const filterMany = oneToManyFunction(filterOne);

  const convertMany = oneToManyFunction(convertOne);

  const filterFieldMany = oneToManyFunction(filterFieldOne);

  const defaultFunctions = {
    init, deleteOne, fetchOne, filterOne, convertOne, filterFieldOne,
    deleteMany, fetchMany, filterMany, convertMany, filterFieldMany
  };

  return defaultFunctions[func];
}

export function fetchOptionFunctions(option:any[], functionNeeded:string[]):any {
  const result = {};
  for (const func of functionNeeded) {
    if (option[func]) {
      result[func] = option[func];
    }
    else if (func.substr(-3) == 'One') {
      const functionMany = func.substr(0, func.length - 3) + 'Many';
      if (option[functionMany]) {
        result[func] = manyToOneFunction(option[functionMany]);
      }
      else {
        result[func] = defaultFunction(func);
      }
    } else if (func.substr(-4) == 'Many') {
      const functionOne = func.substr(0, func.length - 4) + 'One';
      if (option[functionOne]) {
        result[func] = oneToManyFunction(option[functionOne]);
      }
      else {
        result[func] = defaultFunction(func);
      }
    } else {
      result[func] = defaultFunction(func);
           }
  }

  return result;
}
