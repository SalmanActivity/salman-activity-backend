import ReportAccessor from './reportAccessor'
import Report from './report'
import ReportMongoAccessor from './reportMongoAccessor'
import { DivisionAccessor, DivisionMongoAccessor } from '../division'
import { LocationAccessor, LocationMongoAccessor } from '../location'
import { RequestAccessor, RequestMongoAccessor } from '../request'
import * as crudUtil from '../crud'
import * as joi from 'joi'


async function fetchReportByMonth(req, reportAccessor:ReportAccessor) {
  let monthFilter = new Date().getMonth()
  let yearFilter = new Date().getFullYear()

  if (req.query.month)
    // js month is zero based
    monthFilter = Number(req.query.month) - 1
  if (req.query.year)
    yearFilter = Number(req.query.year)

  if (isNaN(monthFilter) || isNaN(yearFilter) || monthFilter < 0 || monthFilter >= 12) {
    monthFilter = 0
    yearFilter = 9999
  }

  let startFilter = new Date(yearFilter, monthFilter, 1)
  let endFilter = new Date(yearFilter, monthFilter + 1, 1)
  return reportAccessor.getAllBetween(startFilter, endFilter)
}

async function filterResultByUser (currentUser, report: Report) {
  if (currentUser) {
    if (currentUser.admin) {
      return report
    } else {
      return report.division.id === currentUser.division.id ? report : null
    }
  } else {
    return report.status === 'accepted' && report.enabled ? report : null
  }
}

let filterField = crudUtil.filterOne.fields(['id','image','description',
  'reporter', 'phoneNumber',
  'issuer.id','issuer.name','issuer.username','issuer.email',
  'issuedTime',
  'division.id', 'division.name', 'division.enabled',
  'location.id', 'location.name', 'location.enabled',
  'startTime', 'endTime', 'participantNumber',
  'participantDescription', 'speaker', 'target', 'status', 'enabled'])

