import { Document } from 'mongoose'

export default interface MongoDocumentSerializer<T> {

  serialize(mongoDocument: Document): Promise<T>

}