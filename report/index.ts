import { Router } from 'express'
import { auth, admin, user } from '../auth'
import * as crud from './crud'

export let router: Router = Router()

router.get('/reports', user(), crud.findReportInMonth())
router.get('/requests/:requestId/report', user(), crud.findReportByRequest())
router.post('/requests/:requestId/report', auth(), crud.createOneReport())
router.put('/requests/:requestId/report', user(), crud.updateOneReport())
router.delete('/requests/:requestId/report', auth(), crud.deleteOneReport())

export { default as Report } from './report'
export { default as ReportAccessor } from './reportAccessor'
export { default as ReportMongoAccessor, ReportMongoDocumentSerializer } from './reportMongoAccessor'
export { default as ReportMongoModel } from './reportMongoModel'