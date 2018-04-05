import { User } from '../user'
import { Division } from '../division'
import { Location } from '../location'
import { Item } from '../accessor'

export enum RequestStatus {
  pending = 'pending',
  accepted = 'accepted',
  rejeced = 'rejeced'
}

export default interface Request extends Item {
  
  name: string

  description: string

  issuer: User
  
  issuedTime: Date

  division: Division

  location: Location

  startTime: Date
  
  endTime: Date

  participantNumber: number
  
  participantDescription: string

  speaker: string

  status: RequestStatus

  enabled: boolean

}