import 'mocha'
import * as sinon from 'sinon'
import { assert } from 'chai'
import * as crud from './crud'
import {InMemoryAccessor } from '../accessor'
import Report from './report'
import ReportAccessor from './reportAccessor'
import { RequestStatus, Request, RequestAccessor } from '../request'

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

class FakeRequestAccessor extends InMemoryAccessor<Request> implements RequestAccessor {
  getAllBetween(start: Date, end: Date): Promise<Request[]> {
    throw new Error("Method not implemented.");
  }
}

function createDefaultUser(obj) {
  if (!obj) obj = {}
  let defaultUser = {
    id: '',
    name: '',
    username: '',
    email: '',
    password: '',
    division: createDefaultDivision(obj.division),
    enabled: true,
    admin: false,
  }
  return Object.assign(defaultUser, obj)
}

function createDefaultDivision(obj) {
  if (!obj) obj = {}
  return Object.assign({
    id: '',
    name: '',
    enabled: true
  }, obj)
}

function createDefaultRequest(obj) {
  if (!obj) obj = {}
  let defaultRequest = {
    id: '',
    name: '',
    description: '',
    personInCharge: '',
    phoneNumber: '',
    issuer: createDefaultUser(obj.issuer),
    issuedTime: null,
    division: createDefaultDivision(obj.division),
    location: null,
    startTime: null,
    endTime: null,
    participantNumber: '',
    participantDescription: '',
    speaker: '',
    target: '',
    status: RequestStatus.accepted ,
    enabled: true,
  }
  return Object.assign(defaultRequest, obj)
}

describe('report crud endpoint test', () => {
  
  let reportDocuments = []
  let findStub, findOneStub, populateStub, req = {}, res, next, sandbox, clock
  let reportAccessor: ReportAccessor
  let requestAccessor: RequestAccessor
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
      createDefaultRequest({
        id: '5aaa89e2a892471e3cdc84e5',
        division: {
          id: '5aaa89e2a892471e3cdc84e4'
        }
      }),
      createDefaultRequest({
        id: '5aaa89e2a892471e3cdc84ec',
        division: {
          id: '5aaa89e2a892471e3cdc84e4'
        }
      }),
      createDefaultRequest({
        id: '5aaa89e2a892471e3cdc84ea',
        division: {
          id: '5aaa89e2a892471e3cdc84eb'
        }
      }),
      createDefaultRequest({
        id: '5aaa89e2a892471e3cdc84ee',
        division: {
          id: '5aaa89e2a892471e3cdc84eb'
        }
      }),
      createDefaultRequest({
        id: '5aaa89e2a892471e3cdc84f0',
        division: {
          id: '5aaa89e2a892471e3cdc84eb'
        }
      }),
      createDefaultRequest({
        id: '5aaa89e2a892471e3cdc84f1',
        division: {
          id: '5aaa89e2a892471e3cdc84e4'
        },
        status: RequestStatus.pending
      })
    ]
    for (let request of requestDocuments) {
      request['name'] = undefined
      request['description'] = undefined
      request['personInCharge'] = undefined
      request['phoneNumber'] = undefined
      request['issuer'] = undefined
      request['issuedTime'] = undefined
      request['startTime'] = undefined
      request['endTime'] = undefined
      request['participantNumber'] = undefined
      request['participantDescription'] = undefined
      request['speaker'] = undefined
      request['target'] = undefined
      request['enabled'] = undefined
    }

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
    requestAccessor = new FakeRequestAccessor(requestDocuments)

    findReportInMonthEndpoint = crud.findReportInMonth(reportAccessor)
    findReportByRequestEndpoint = crud.findReportByRequest(reportAccessor)
    createOneReportEndpoint = crud.createOneReport(reportAccessor, requestAccessor)
    deleteOneReportEndpoint = crud.deleteOneReport(reportAccessor, requestAccessor)
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

  describe('GET specific report by request endpoint', () => {

    it('return specific report when loggin as admin', done => {
      let req = {user: {admin: true}, params:{requestId: '5aaa89e2a892471e3cdc84e5'}}
      findReportByRequestEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let ret = res.json.getCall(0).args[0]
        sinon.assert.match(ret.id, '5aaa89e2a892471e3cdc84e7')
        sinon.assert.match(ret.content, 'just another report content 1, lorem ipsum dos color sit amet')
        done()
      }).catch(done)
    })

    it('return specific report in its division when loggin as division', done => {
      let req = {user: {division: {id:'5aaa89e2a892471e3cdc84eb'}}, params:{requestId: '5aaa89e2a892471e3cdc84ea'}}
      findReportByRequestEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let ret = res.json.getCall(0).args[0]
        sinon.assert.match(ret.id, '5aaa89e2a892471e3cdc84e8')
        sinon.assert.match(ret.content, 'just another report content 3, lorem ipsum dos color sit amet')
        done()
      }).catch(done)
    })

    it('return 403 when division want to read report from another division', done => {
      let req = {user: {division: {id:'5aaa89e2a892471e3cdc84e4'}}, params:{requestId: '5aaa89e2a892471e3cdc84ea'}}
      findReportByRequestEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 403)
        done()
      }).catch(done)
    })

    it('return 404 when report has not been created', done => {
      let req = {user: {admin:true}, params:{requestId: '5aaa89e2a892471e3cdc84f0'}}
      findReportByRequestEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        done()
      }).catch(done)
    })

    it('return 404 when request not found', done => {
      let req = {user: {admin:true}, params:{requestId: '5aaa89e2a892471e3cdc84ef'}}
      findReportByRequestEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        done()
      }).catch(done)
    })

  })

  describe('POST report endpoint', () => {
    
    it('should store a new report and return the report when user login as admin', done => {
      let req = {
        user: {admin: true},
        params: {requestId: '5aaa89e2a892471e3cdc84f0'},
        body: {
          'content': 'new report content',
          'photo': 'some base 64 image is here'
        }
      }
      createOneReportEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let ret = res.json.getCall(0).args[0]
        sinon.assert.match(ret.content, 'new report content')
        done()
      }).catch(done)
    })

    it('should store a new report when user login as division and create report on its division', done => {
      let req = {
        user: {division: {id: '5aaa89e2a892471e3cdc84eb'}},
        params: {requestId: '5aaa89e2a892471e3cdc84f0'},
        body: {
          'content': 'new report content',
          'photo': 'some base 64 image is here'
        }
      }
      createOneReportEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let ret = res.json.getCall(0).args[0]
        sinon.assert.match(ret.content, 'new report content')
        done()
      }).catch(done)
    })

    it('should return validation error when content is missing', done => {
      let req = {
        user: {admin: true},
        params: {requestId: '5aaa89e2a892471e3cdc84f0'},
        body: {
          'photo': 'some base 64 image is here'
        }
      }
      createOneReportEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        done()
      }).catch(done)
    })

    it('should return validation error when content is too short', done => {
      let req = {
        user: {admin: true},
        params: {requestId: '5aaa89e2a892471e3cdc84f0'},
        body: {
          'content': 'a',
          'photo': 'some base 64 image is here'
        }
      }
      createOneReportEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        done()
      }).catch(done)
    })

    it('should return validation error when report has been created', done => {
      let req = {
        user: {admin: true},
        params: {requestId: '5aaa89e2a892471e3cdc84e5'},
        body: {
          'content': 'new report content',
          'photo': 'some base 64 image is here'
        }
      }
      createOneReportEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        done()
      }).catch(done)
    })

    it('should return validation error when request status is not accepted', done => {
      let req = {
        user: {division: {id: '5aaa89e2a892471e3cdc84e4'}},
        params: {requestId: '5aaa89e2a892471e3cdc84f1'},
        body: {
          'content': 'new report content',
          'photo': 'some base 64 image is here'
        }
      }
      createOneReportEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        done()
      }).catch(done)
    })

    it('should return 403 when division want to create report of another division request', done => {
      let req = {
        user: {division: {id: '5aaa89e2a892471e3cdc84eb'}},
        params: {requestId: '5aaa89e2a892471e3cdc84f1'},
        body: {
          'content': 'new report content',
          'photo': 'some base 64 image is here'
        }
      }
      createOneReportEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 403)
        done()
      }).catch(done)
    })

    it('should return 404 when request not found', done => {
      let req = {
        user: {division: {id: '5aaa89e2a892471e3cdc84eb'}},
        params: {requestId: '5aaa89e2a892471e3cdc84ff'},
        body: {
          'content': 'new report content',
          'photo': 'some base 64 image is here'
        }
      }
      createOneReportEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        done()
      }).catch(done)
    })

  })

  describe('PUT specific report endpoint', () => {

    it('should update report and return the updated report', done => {
      done()
    })

    it('should return validation error when content is too short', done => {
      done()
    })

    it('should return 403 when division want to create report of another division request', done => {
      done()
    })

    it('should return 404 when report has not been created', done => {
      done()
    })

    it('should return 404 when request not found', done => {
      done()
    })

  })

  describe('DELETE specific report endpoint', () => {

    it('should delete specific report when loggin as admin', done => {
      let req = {user: {admin: true}, params:{requestId: '5aaa89e2a892471e3cdc84e5'}}
      deleteOneReportEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 202)
        let ret = res.json.getCall(0).args[0]
        sinon.assert.match(ret.id, '5aaa89e2a892471e3cdc84e7')
        sinon.assert.match(ret.content, 'just another report content 1, lorem ipsum dos color sit amet')
        done()
      }).catch(done)
    })

    it('should delete specific report in when loggin as division', done => {
      let req = {user: {division: {id:'5aaa89e2a892471e3cdc84eb'}}, params:{requestId: '5aaa89e2a892471e3cdc84ea'}}
      deleteOneReportEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 202)
        let ret = res.json.getCall(0).args[0]
        sinon.assert.match(ret.id, '5aaa89e2a892471e3cdc84e8')
        sinon.assert.match(ret.content, 'just another report content 3, lorem ipsum dos color sit amet')
        done()
      }).catch(done)
    })

    it('should return 403 when division want to delete report of another division request', done => {
      let req = {user: {division: {id:'5aaa89e2a892471e3cdc84e4'}}, params:{requestId: '5aaa89e2a892471e3cdc84ea'}}
      deleteOneReportEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 403)
        done()
      }).catch(done)
    })

    it('should return 404 when request not found', done => {
      let req = {user: {division: {id:'5aaa89e2a892471e3cdc84e4'}}, params:{requestId: '5aaa89e2a892471e3cdc84ff'}}
      deleteOneReportEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        done()
      }).catch(done)
    })

  })

})