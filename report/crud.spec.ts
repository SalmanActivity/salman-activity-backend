import 'mocha'
import * as sinon from 'sinon'
import { assert } from 'chai'
import * as crud from './crud'
import {InMemoryAccessor } from '../accessor'
import Report from './report'
import ReportAccessor from './reportAccessor'

class FakeReportAccessor extends InMemoryAccessor<Report> implements ReportAccessor {
  async getAllBetween(start: Date, end: Date): Promise<Report[]> {
    return this.documents.filter(report =>
      report.issuedTime.getTime() > start.getTime() &&
      report.issuedTime.getTime() <= end.getTime())

  }
  async getByRequestId(requestId: string): Promise<Report> {
    for (let report of this.documents)
      if (report.request.id === requestId)
        return report
    return null
  }
}

describe('report crud endpoint test', () => {
  
  let reportDocuments = []
  let findStub, findOneStub, populateStub, req = {}, res, next, sandbox, clock
  let reportAccessor: ReportAccessor
  let findReportInMonthEndpoint,
      findReportByRequestEndpoint,
      createOneReportEndpoint,
      deleteOneReportEndpoint,
      updateOneReportEndpoint

  beforeEach(() => {
    next = sinon.stub()
    res = {status:sinon.stub(), json:sinon.stub(), header:sinon.stub()}
    res.status.returnsThis()
    res.json.returnsThis()

    let requestDocuments = [
      {
        id: '5aaa89e2a892471e3cdc84e5',
        division: {
          id: '5aaa89e2a892471e3cdc84e4'
        }
      },
      {
        id: '5aaa89e2a892471e3cdc84ec',
        division: {
          id: '5aaa89e2a892471e3cdc84e4'
        }
      },
      {
        id: '5aaa89e2a892471e3cdc84ea',
        division: {
          id: '5aaa89e2a892471e3cdc84eb'
        }
      },
      {
        id: '5aaa89e2a892471e3cdc84ee',
        division: {
          id: '5aaa89e2a892471e3cdc84eb'
        }
      }
    ]

    let photoDocuments = [
      {
        id: '5aaa89e2a892471e3cdc84e6',
        name: 'krabby patty',
        uploadTime: new Date(2018, 1, 2, 10),
        mime: 'image/jpeg',
        readableStream: null
      }
    ]
    
    reportDocuments = [
      {
        id: '5aaa89e2a892471e3cdc84e7',
        issuedTime: new Date(2018, 1, 2, 10),
        request: requestDocuments[0],
        content: 'just another report content 1, lorem ipsum dos color sit amet',
        photo: photoDocuments[0]
      },
      {
        id: '5aaa89e2a892471e3cdc84ed',
        issuedTime: new Date(2018, 1, 2, 10),
        request: requestDocuments[1],
        content: 'just another report content 2, lorem ipsum dos color sit amet',
        photo: photoDocuments[0]
      },
      {
        id: '5aaa89e2a892471e3cdc84e8',
        issuedTime: new Date(2019, 1, 4, 10),
        request: requestDocuments[2],
        content: 'just another report content 3, lorem ipsum dos color sit amet',
        photo: photoDocuments[0]
      },
      {
        id: '5aaa89e2a892471e3cdc84e9',
        issuedTime: new Date(2018, 5, 6, 10),
        request: requestDocuments[3],
        content: 'just another report content 4, lorem ipsum dos color sit amet',
        photo: photoDocuments[0]
      },
      {
        id: '5aaa89e2a892471e3cdc84ef',
        issuedTime: new Date(2019, 5, 6, 10),
        request: requestDocuments[3],
        content: 'just another report content 5, lorem ipsum dos color sit amet',
        photo: photoDocuments[0]
      }
    ]

    reportAccessor = new FakeReportAccessor(reportDocuments)
    findReportInMonthEndpoint = crud.findReportInMonth(reportAccessor)
    findReportByRequestEndpoint = crud.findReportByRequest(reportAccessor)
    createOneReportEndpoint = crud.createOneReport(reportAccessor)
    deleteOneReportEndpoint = crud.deleteOneReport(reportAccessor)
    updateOneReportEndpoint = crud.updateOneReport(reportAccessor)

    sandbox = sinon.sandbox.create()
    clock = sinon.useFakeTimers(new Date(2018, 1, 15).getTime())
  })

  afterEach(() => {
    res.status.reset()
    res.json.reset()
    res.header.reset()
    next.reset()

    sandbox.restore()
    clock.restore()
  })

  describe('GET reports in month endpoint', () => {

  	it('should return all reports in month when login as admin', (done) => {
      let req = {user: {admin: true}, query:{}}
      findReportInMonthEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let ret = res.json.getCall(0).args[0]
        sinon.assert.match(ret[0].id, '5aaa89e2a892471e3cdc84e7')
        sinon.assert.match(ret[0].content, 'just another report content 1, lorem ipsum dos color sit amet')
        done()
      }).catch(done)
    })

    it('should return all reports specific division in month when login as division', (done) => {
      let req = {user: {division:{id:'5aaa89e2a892471e3cdc84e4'}}, query:{}}
      findReportInMonthEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let ret = res.json.getCall(0).args[0]
        assert.isNotEmpty(ret)
        for (let report of ret)
          sinon.assert.match(report.request.division.id, '5aaa89e2a892471e3cdc84e4')
        done()
      }).catch(done)
    })

    it('should return all reports in specific month when login as admin', (done) => {
      let req = {user: {admin: true}, query:{month:6}}
      findReportInMonthEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let ret = res.json.getCall(0).args[0]
        sinon.assert.match(ret[0].id, '5aaa89e2a892471e3cdc84e9')
        sinon.assert.match(ret[0].content, 'just another report content 4, lorem ipsum dos color sit amet')
        done()
      }).catch(done)
    })

    it('should return all reports in specific year when login as admin', (done) => {
      let req = {user: {admin: true}, query:{year:2019}}
      findReportInMonthEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let ret = res.json.getCall(0).args[0]
        sinon.assert.match(ret[0].id, '5aaa89e2a892471e3cdc84e8')
        sinon.assert.match(ret[0].content, 'just another report content 3, lorem ipsum dos color sit amet')
        done()
      }).catch(done)
    })

    it('should return all reports in specific month and year when login as admin', (done) => {
      let req = {user: {admin: true}, query:{year:2019, month:6}}
      findReportInMonthEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let ret = res.json.getCall(0).args[0]
        sinon.assert.match(ret[0].id, '5aaa89e2a892471e3cdc84ef')
        sinon.assert.match(ret[0].content, 'just another report content 5, lorem ipsum dos color sit amet')
        done()
      }).catch(done)
    })

  })

})