import { Router } from 'express'
import { auth, admin } from '../auth'
import * as crud from './crud'

export let router: Router = Router()

router.get('/', auth(), crud.findAllLocations())
router.get('/:locationId', auth(), crud.findOneLocation())
router.post('/', auth(), admin, crud.createOneLocation())
router.put('/:locationId', auth(), admin, crud.updateOneLocation())
router.delete('/:locationId', auth(), admin, crud.deleteOneLocation())

export { default as Location } from './location'
export { default as LocationAccessor } from './locationAccessor'
export { default as LocationMongoAccessor } from './locationMongoAccessor'
export { default as LocationMongoModel } from './locationMongoModel'