import { UserAccessor } from './userAccessor';
import { UserMongoAccessor } from './userMongoAccessor';
import { DivisionAccessor, DivisionMongoAccessor } from '../division';
import * as crudUtil from '../crud';
import * as joi from 'joi';
import * as passwordHash from 'password-hash';

async function filterUserByRole(user, context) {
  const curUser = context.user;
  if (curUser.id !== user.id && !curUser.admin) {
    try {
      const currDivId = curUser.division.id;
      const userDivId = user.division.id;
      if (currDivId === userDivId) {
        return user;
      }
      else {
        throw new Error('different division');
      }
    } catch (e) {
      return null;
    }
  }
  else {
    return user;
  }
}

const filterField = crudUtil.filterOne.fields(['id', 'name', 'username', 'email', 'division', 'enabled', 'admin']);

export function findAllUsers(userAccessor:UserAccessor = new UserMongoAccessor()) {
  return crudUtil.readMany({
    init: async (req, context) => context.user = req.user,
    fetchMany: (req, context) => userAccessor.getAll(),
    filterOne: filterUserByRole,
    filterFieldOne: filterField
  });
}

export function findOneUser(userAccessor:UserAccessor = new UserMongoAccessor()) {
  return crudUtil.readOne({
    init: async (req, context) => {
      context.user = req.user;
      return req;
    },
    fetchOne: (req, context) => userAccessor.getById(req.params.userId),
    filterOne: filterUserByRole,
    filterFieldOne: filterField
  });
}

export function findCurrentUser(userAccessor:UserAccessor = new UserMongoAccessor()) {
  return crudUtil.readOne({
    fetchOne: (req, context) => userAccessor.getById(req.user.id),
    filterFieldOne: filterField
  });
}

export function deleteOneUser(userAccessor:UserAccessor = new UserMongoAccessor()) {
  return crudUtil.deleteOne({
    fetchOne: (req, context) => userAccessor.getById(req.params.userId),
    deleteOne: (user, context) => {
      user.enabled = false;
      userAccessor.update(user);
    }
  });
}

const validateUserInput = async (updatingUser, userInput, userAccessor:UserAccessor,
                               divisionAccessor:DivisionAccessor) => {
  const extendedJoi = joi.extend({
    name: 'string',
    base: joi.string(),
    rules:[
      {
        name: 'passwordHash',
        validate: (param, value, state, option) => value ? passwordHash.generate(value) : value
      }
    ]
  });

  let schema = extendedJoi.object().keys({
    name: extendedJoi.string().min(3).max(255),
    username: extendedJoi.string().min(3).max(64),
    email: extendedJoi.string().email().min(3).max(255),
    password: extendedJoi.string().min(3).max(100).passwordHash(),
    division: extendedJoi.string().hex().length(24),
    enabled: extendedJoi.boolean(),
    admin: extendedJoi.boolean()
  });
  if (!updatingUser) {
    schema = schema.requiredKeys('name', 'username', 'email', 'password');
  }
  const validationResult = schema.validate(userInput);
  if (validationResult.error) {
    throw validationResult.error.details[0].message;
  }

  const validatedValue = validationResult.value;
  
  const result = await Promise.all([
    divisionAccessor.getById(validatedValue.division),
    userAccessor.getByUsername(validatedValue.username),
    userAccessor.getByEmail(validatedValue.email)
  ]);
    
  if (validatedValue.division && !result[0]) {
    throw new Error('division not found');
  } else if (validatedValue.division) {
    validatedValue.division = result[0];
  }

  const updatingUsername = updatingUser ? updatingUser.username : null;
  const updatingEmail = updatingUser ? updatingUser.email : null;

  if (result[1] && result[1].username && result[1].username !== updatingUsername) {
    throw new Error('username already taken');
  } else if (result[2] && result[2].email && result[2].email !== updatingEmail) {
    throw new Error('email already taken');
  }

  return validatedValue;
};

export function createOneUser(userAccessor:UserAccessor = new UserMongoAccessor(),
                              divisionAccessor:DivisionAccessor = new DivisionMongoAccessor()) {
  return crudUtil.createOne({
    validateOne: (req, context) => validateUserInput(null, req.body, userAccessor, divisionAccessor),
    insertOne: (validatedData, context) => userAccessor.insert(validatedData),
    filterFieldOne: filterField
  });
}

export function updateOneUser(userAccessor:UserAccessor = new UserMongoAccessor(),
                              divisionAccessor:DivisionAccessor = new DivisionMongoAccessor()) {
  return crudUtil.updateOne({
    init: (req, context) => context.request = req,
    fetchOne: async (req, context) => context.updatingUser = await userAccessor.getById(req.params.userId),
    validateOne: (updatingUser, context) => validateUserInput(updatingUser, context.request.body,
                                                              userAccessor, divisionAccessor),
    updateOne: (validatedData, context) =>
      userAccessor.update(Object.assign(context.updatingUser, validatedData)),
    filterFieldOne: filterField
  });
}