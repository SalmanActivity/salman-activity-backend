import { Router } from 'express';
import { auth, admin, user } from '../auth';
import * as crud from './crud';

export let router: Router = Router();

router.get('/', user(), crud.findRequestInMonth());
router.get('/:requestId', user(), crud.findOneRequest());
router.post('/', auth(), crud.createOneRequest());
router.put('/:requestId', user(), crud.updateOneRequest());
router.delete('/:requestId', auth(), crud.deleteOneRequest());

export { Request, RequestStatus } from './request';
export { RequestAccessor } from './requestAccessor';
export { RequestMongoAccessor, RequestMongoDocumentSerializer } from './requestMongoAccessor';
export { RequestMongoModel } from './requestMongoModel';