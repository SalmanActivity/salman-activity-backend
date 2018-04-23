import { Item } from '../accessor';
import { Request } from '../request';
import { Photo } from '../photo';

export default interface Report extends Item {

  issuedTime: Date;

  request: Request;

  content: string;

  photo: Photo;
  
}	