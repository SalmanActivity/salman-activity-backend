import DivisionAccessor from './divisionAccessor'
import DivisionMongoAccessor from './divisionMongoAccessor'
import * as crudUtil from '../crud'
import * as joi from 'joi'

let filterFieldOne = crudUtil.filterOne.fields(['id', 'name', 'enabled'])

export function findAllDivisions (divisionAccessor:DivisionAccessor = new DivisionMongoAccessor()) {
  return crudUtil.readMany({
    fetchMany: (req, context) => divisionAccessor.getAll(),
    filterFieldOne
  })
}

export function findOneDivision (divisionAccessor:DivisionAccessor = new DivisionMongoAccessor()) {
  return crudUtil.readOne({
    fetchOne: (req, context) => divisionAccessor.getById(req.params.divisionId),
    filterFieldOne
  })
}

export function deleteOneDivision (divisionAccessor:DivisionAccessor = new DivisionMongoAccessor()) {
  return crudUtil.deleteOne({
    fetchOne: (req, context) => divisionAccessor.getById(req.params.divisionId),
    deleteOne: (division, context) => {
      division.enabled = false
      divisionAccessor.delete(division)
    },
    filterFieldOne
  })
}

let validate = async (updating, userInput) => {
  let schema = joi.object().keys({
    name: joi.string().min(3).max(255),
  })
  if (!updating)
    schema = schema.requiredKeys('name')
  let validationResult = schema.validate(userInput)
  if (validationResult.error)
    throw validationResult.error.details[0].message
  return validationResult.value
}

export function createOneDivision(divisionAccessor:DivisionAccessor = new DivisionMongoAccessor()) {
  return crudUtil.createOne({
    validateOne: (req, context) => validate(null, req.body),
    insertOne: (validatedData, context) => divisionAccessor.insert(validatedData),
    filterFieldOne
  })
}

export function updateOneDivision (divisionAccessor:DivisionAccessor = new DivisionMongoAccessor()) {
  return crudUtil.updateOne({
    init: (req, context) => context.request = req,
    fetchOne: async (req, context) => context.updating = await divisionAccessor.getById(req.params.divisionId),
    validateOne: (divisionDb, context) => validate(context.updating, context.request.body),
    updateOne: (validatedData, context) => {
      let updateData = Object.assign(context.updating, validatedData)
      return divisionAccessor.update(updateData)
    },
    filterFieldOne
  })
}