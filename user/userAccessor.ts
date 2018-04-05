import { Accessor } from '../accessor'
import User from './user'

export default interface UserAccessor extends Accessor<User> {

  getByUsername(username:string):Promise<User>

  getByEmail(email:string):Promise<User>

}