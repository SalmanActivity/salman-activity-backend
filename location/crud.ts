import LocationAccessor from './locationAccessor'
import LocationMongoAccessor from './locationMongoAccessor'
import * as crudUtil from '../crud'
import * as joi from 'joi'

let filterFieldOne = crudUtil.filterOne.fields(['id', 'name', 'enabled'])

export function findAllLocations(locationAccessor:LocationAccessor = new LocationMongoAccessor()) {
  return crudUtil.readMany({
    fetchMany: (req, context) => locationAccessor.getAll(),
    filterFieldOne
  })
}

export function findOneLocation(locationAccessor:LocationAccessor = new LocationMongoAccessor()) {
  return crudUtil.readOne({
    fetchOne: (req, context) => locationAccessor.getById(req.params.locationId),
    filterFieldOne
  })
}

export function deleteOneLocation(locationAccessor:LocationAccessor = new LocationMongoAccessor()) {
  return crudUtil.deleteOne({
    fetchOne: (req, context) => locationAccessor.getById(req.params.locationId),
    deleteOne: (location, context) => {
      location.enabled = false
      locationAccessor.update(location)
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

export function createOneLocation(locationAccessor:LocationAccessor = new LocationMongoAccessor()) {
  return crudUtil.createOne({
    validateOne: (req, context) => validate(null, req.body),
    insertOne: (validatedData, context) => locationAccessor.insert(validatedData),
    filterFieldOne
  })
}

export function updateOneLocation(locationAccessor:LocationAccessor = new LocationMongoAccessor()) {
  return crudUtil.updateOne({
    init: (req, context) => context.request = req,
    fetchOne: async (req, context) => context.updating = await locationAccessor.getById(req.params.locationId),
    validateOne: (locationDb, context) => validate(context.updating, context.request.body),
    updateOne: (validatedData, context) => {
      let updateData = Object.assign(context.updating, validatedData)
      return locationAccessor.update(updateData)
    },
    filterFieldOne
  })
}