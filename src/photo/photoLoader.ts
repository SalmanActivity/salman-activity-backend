import { Photo } from './photo';
import * as stream from 'stream';

export async function loadPhotoFromBase64(input: string): Promise<Photo> {
  if (input.startsWith('data:')) {
    input = input.substring(5);
  }

  const [mime, base64WithHeader] = input.split(';');
  
  let base64 = base64WithHeader;
  if (base64.startsWith('base64,')) {
    base64 = base64.substr(7);
  }

  const buffer = new Buffer(base64, 'base64');
  const readableStream = new stream.Readable();
  readableStream._read = () => {};
  readableStream.push(buffer);
  readableStream.push(null);

  return {
    name: null,
    uploadTime: null,
    mime,
    readableStream
  };
}