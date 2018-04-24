import { Router } from 'express';
import { auth, admin } from '../auth';
import * as crud from './crud';

export let router: Router = Router();

router.get('/', auth(), crud.findAllDivisions());
router.get('/:divisionId', auth(), crud.findOneDivision());
router.post('/', auth(), admin(), crud.createOneDivision());
router.put('/:divisionId', auth(), admin(), crud.updateOneDivision());
router.delete('/:divisionId', auth(), admin(), crud.deleteOneDivision());

export { Division } from './division';
export { DivisionAccessor } from './divisionAccessor';
export { DivisionMongoAccessor, DivisionMongoDocumentSerializer } from './divisionMongoAccessor';
export { DivisionMongoModel } from './divisionMongoModel';