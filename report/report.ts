import { Item } from '../accessor'
import { Request } from '../request'


export default interface Report extends Item {

  issuedTime: Date

  request: Request

  content: string

  photo: string
  
}	