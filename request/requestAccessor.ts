import Request from './request'
import { Accessor } from '../accessor'

export default interface RequestAccessor extends Accessor<Request> {

  getAllBetween(start:Date, end:Date):Promise<Request[]>

}
