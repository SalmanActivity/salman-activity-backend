import Photo from './photo'
import * as stream from 'stream'

export async function loadPhotoFromBase64(input: string): Promise<Photo> {
  if (input.startsWith('data:'))
    input = input.substring(5)

  let [mime, base64] = input.split(';')

  if (base64.startsWith('base64,'))
    base64 = base64.substr(7)

  let buffer = new Buffer(base64, 'base64')
  let readableStream = new stream.Readable()
  readableStream._read = () => {}
  readableStream.push(buffer)
  readableStream.push(null)

  return {
    name: null,
    uploadTime: null,
    mime,
    readableStream
  }
}