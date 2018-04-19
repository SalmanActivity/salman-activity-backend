import * as stream from 'stream'
import * as fs from 'fs'
import * as util from 'util'
import { Schema, Model, Document, model } from 'mongoose'
import { MongoAccessor, MongoDocumentSerializer } from '../accessor/mongo'
import PhotoAccessor from './photoAccessor'
import Photo from './photo'
import PhotoModel from './photoMongoModel'
import config from '../config'


export class PhotoMongoDocumentSerializer implements MongoDocumentSerializer<Photo> {

  constructor(private storageLocation: string = config.photoStorage) {
  }

  async serialize(mongoDocument: Document): Promise<Photo> {
    if (!mongoDocument)
      return null

    try {
      await util.promisify(fs.mkdir)(config.photoStorage)
    } catch (err) {
      if (err.code != 'EEXIST')
        throw err
    }

    let filename = `${config.photoStorage}/${mongoDocument._id}.${mongoDocument.get('mime').split('/')[1]}`
    let readableStream = fs.createReadStream(filename)
    return {
      id: mongoDocument._id ? mongoDocument._id.toString() : undefined,
      name: mongoDocument.get('name'),
      mime: mongoDocument.get('mime'),
      uploadTime: mongoDocument.get('uploadTime'),
      readableStream: fs.createReadStream(filename)
    }
  }

  async deserialize(document: Photo): Promise<any> {
    if (!document)
      return null
    
    return {
      _id: document.id,
      name: document.name,
      mime: document.mime,
      uploadTime: document.uploadTime,
    }
  }

}

export default class PhotoMongoAccessor extends MongoAccessor<Photo> implements PhotoAccessor {
  constructor() {
    super(PhotoModel, new PhotoMongoDocumentSerializer(config.photoStorage))
  }

  private async writePhoto(photo: Photo) {
    try {
      await util.promisify(fs.mkdir)(config.photoStorage)
    } catch (err) {
      if (err.code != 'EEXIST')
        throw err
    }
    
    let filename = `${config.photoStorage}/${photo.id}.${photo.mime.split('/')[1]}`
    let writeStream = fs.createWriteStream(filename)
    photo.readableStream.pipe(writeStream)

    await util.promisify(writeStream.on.bind(writeStream, 'finish'))()

    photo.readableStream = fs.createReadStream(filename)
  }

  async insert(object: Photo): Promise<Photo> {
    let photo: Photo = await super.insert(object)
    await this.writePhoto(object)
    return photo
  }

  async update(object: Photo): Promise<Photo> {
    let photo: Photo = await super.update(object)
    await this.writePhoto(object)
    return photo
  }

}