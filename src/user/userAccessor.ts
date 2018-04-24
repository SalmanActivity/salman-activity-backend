import { Accessor } from '../accessor';
import { User } from './user';

export interface UserAccessor extends Accessor<User> {

  getByUsername(username:string):Promise<User>;

  getByEmail(email:string):Promise<User>;

}