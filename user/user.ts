import { Division } from '../division/division'
import { Item } from '../accessor'

export default interface User extends Item {

  name: string

  username: string
  
  email: string
  
  password: string
  
  division: Division
  
  enabled: boolean
  
  admin: boolean

}