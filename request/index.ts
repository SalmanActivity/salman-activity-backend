import { Router } from 'express'
import { auth, admin } from '../auth'
import * as crud from './crud'

export let router: Router = Router()

// router.get('/', auth.user, crud.findAllRequests)
// router.get('/:requestId', auth.user, crud.findOneRequest)
// router.post('/', auth.auth, crud.createOneRequest)
// router.put('/:requestId', auth.user, crud.updateOneRequest)
// router.delete('/:requestId', auth.auth, crud.deleteOneRequest)

export { default as Request } from './request'
export { default as RequestAccessor } from './requestAccessor'
export { default as RequestMongoAccessor } from './requestMongoAccessor'
export { default as RequestMongoModel } from './requestMongoModel'