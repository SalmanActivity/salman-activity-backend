import { Item } from '../accessor'
import { Request } from '../request'
import { User } from '../user'
import { Division } from '../division'

export enum ReportStatus {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected'
}

export default interface Report extends Item {

  image: string

  description: string

  reporter: User

  division: Division

  reportTime: Date

  request: Request

  status: ReportStatus

  enabled: boolean
  
}	