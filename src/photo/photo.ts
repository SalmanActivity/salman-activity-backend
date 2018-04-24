import { Item } from '../accessor';
import * as stream from 'stream';

export interface Photo extends Item {
 
  name: string;

  uploadTime: Date;

  mime: string;

  readableStream: stream.Readable;
  
}