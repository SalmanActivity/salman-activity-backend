import { Router } from 'express';
import { auth, admin, user } from '../auth';
import * as crud from './crud';

export let router: Router = Router();

router.get('/reports', auth(), crud.findReportInMonth());
router.get('/requests/:requestId/report', auth(), crud.findReportByRequest());
router.get('/requests/:requestId/report/photo', crud.findReportImageByRequest());
router.post('/requests/:requestId/report', auth(), crud.createOneReport());
router.put('/requests/:requestId/report', auth(), crud.updateOneReport());
router.delete('/requests/:requestId/report', auth(), crud.deleteOneReport());

export { Report } from './report';
export { ReportAccessor } from './reportAccessor';
export { ReportMongoAccessor, ReportMongoDocumentSerializer } from './reportMongoAccessor';
export { ReportMongoModel } from './reportMongoModel';