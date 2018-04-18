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

  constructor(private storageLocation: string) {
  }

  async serialize(mongoDocument: Document): Promise<Photo> {
    if (!mongoDocument)
      return null

    let filename = `${config.photoStorage}/${mongoDocument._id}.${mongoDocument.get('mime').split('/')[1]}`
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

  async insert(object: Photo): Promise<Photo> {
    let photo: Photo = await super.insert(object)
    let filename = `${config.photoStorage}/${photo.id}.${photo.mime.split('/')[1]}`
    let writeStream = photo.readableStream.pipe(fs.createWriteStream(filename))
    await util.promisify(writeStream.end)()
    return photo
  }

  async update(object: Photo): Promise<Photo> {
    let photo: Photo = await super.update(object)
    let filename = `${config.photoStorage}/${photo.id}.${photo.mime.split('/')[1]}`
    let writeStream = photo.readableStream.pipe(fs.createWriteStream(filename))
    await util.promisify(writeStream.end)()
    return photo
  }

}