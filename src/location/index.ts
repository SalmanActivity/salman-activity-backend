import { Router } from 'express';
import { auth, admin } from '../auth';
import * as crud from './crud';

export let router: Router = Router();

router.get('/', auth(), crud.findAllLocations());
router.get('/:locationId', auth(), crud.findOneLocation());
router.post('/', auth(), admin(), crud.createOneLocation());
router.put('/:locationId', auth(), admin(), crud.updateOneLocation());
router.delete('/:locationId', auth(), admin(), crud.deleteOneLocation());

export { Location } from './location';
export { LocationAccessor } from './locationAccessor';
export { LocationMongoAccessor, LocationMongoDocumentSerializer } from './locationMongoAccessor';
export { LocationMongoModel } from './locationMongoModel';