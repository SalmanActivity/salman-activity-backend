import { Division } from '../division';
import { Item } from '../accessor';

export interface User extends Item {

  name: string;

  username: string;
  
  email: string;
  
  password: string;
  
  division: Division;
  
  enabled: boolean;
  
  admin: boolean;

}