import { Router } from 'express';
import { auth, admin } from '../auth';
import * as crud from './crud';

export let router: Router = Router();

router.get('/', auth(), crud.findAllUsers());
router.get('/me', auth(), crud.findCurrentUser());
router.get('/:userId', auth(), crud.findOneUser());
router.post('/', auth(), admin(), crud.createOneUser());
router.put('/:userId', auth(), admin(), crud.updateOneUser());
router.delete('/:userId', auth(), admin(), crud.deleteOneUser());

export { User } from './user';
export { UserAccessor } from './userAccessor';
export { UserMongoModel } from './userMongoModel';
export { UserMongoAccessor } from './userMongoAccessor';