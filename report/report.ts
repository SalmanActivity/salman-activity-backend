import { Item } from '../accessor'
import { Request } from '../request

export enum ReportStatus {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected'
}

export default interface Report extends Item {

  image: Buffer

  description: string

  request: Request

  status: ReportStatus

  enabled: boolean
  
}	