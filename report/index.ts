import { Router } from 'express'
import { auth, admin, user } from '../auth'
import * as crud from './crud'

export let router: Router = Router()

router.get('/', user(), crud.findReportInMonth())
router.get('/:reportId', user(), crud.findOneReport())
router.post('/', auth(), crud.createOneReport())
router.put('/:reportId', user(), crud.updateOneReport())
router.delete('/:reportId', auth(), crud.deleteOneReport())

export { default as Report, ReportStatus } from './report'
export { default as ReportAccessor } from './reportAccessor'
export { default as ReportMongoAccessor, ReportMongoDocumentSerializer } from './reportMongoAccessor'
export { default as ReportMongoModel } from './reportMongoModel'