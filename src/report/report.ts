import { Item } from '../accessor';
import { Request } from '../request';
import { Photo } from '../photo';

export interface Report extends Item {

  issuedTime: Date;

  request: Request;

  content: string;

  photo: Photo;
  
}	