import { User } from '../user'
import { Division } from '../division'
import { Location } from '../location'
import { Item } from '../accessor'

export enum RequestStatus {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected'
}


export default interface Request extends Item {

  name: string

  description?: string

  personInCharge: string

  phoneNumber: string

  issuer: User

  issuedTime: Date

  division: Division

  location: Location

  startTime: Date

  endTime: Date

  participantNumber?: number

  participantDescription?: string

  speaker?: string

  target?: string

  status: RequestStatus

  enabled: boolean

}
