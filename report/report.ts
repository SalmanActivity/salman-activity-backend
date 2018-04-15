import { Item } from '../accessor'
import { Request } from '../request
import { User } from '../user'
import { Division } from '../division'

export enum ReportStatus {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected'
}

export default interface Report extends Item {

  image: Buffer

  description: string

  reporter: User

  division: Division

  request: Request

  status: ReportStatus

  enabled: boolean
  
}	