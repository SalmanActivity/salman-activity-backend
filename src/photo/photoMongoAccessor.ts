import * as stream from 'stream';
import * as fs from 'fs';
import * as util from 'util';
import { Schema, Model, Document, model } from 'mongoose';
import { MongoAccessor, MongoDocumentSerializer, MongoItem } from '../accessor/mongo';
import { PhotoAccessor } from './photoAccessor';
import { Photo } from './photo';
import { PhotoMongoModel } from './photoMongoModel';
import { config } from '../config';


export class PhotoMongoDocumentSerializer implements MongoDocumentSerializer<Photo> {

  constructor(private storageLocation: string = config.photoStorage) {
  }

  async serialize(mongoDocument: Document): Promise<Photo> {
    if (!mongoDocument) {
      return null;
    }

    try {
      await util.promisify(fs.mkdir)(config.photoStorage);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }

    const filename = `${config.photoStorage}/${mongoDocument._id}.${mongoDocument.get('mime').split('/')[1]}`;
    await util.promisify(fs.stat)(filename);
    const readableStream = fs.createReadStream(filename);

    return {
      id: mongoDocument._id ? mongoDocument._id.toString() : undefined,
      name: mongoDocument.get('name'),
      mime: mongoDocument.get('mime'),
      uploadTime: mongoDocument.get('uploadTime'),
      readableStream
    };
  }

  async deserialize(document: Photo): Promise<MongoItem> {
    if (!document) {
      return null;
    }
    
    return {
      _id: document.id,
      name: document.name,
      mime: document.mime,
      uploadTime: document.uploadTime,
    } as MongoItem;
  }

}

export class PhotoMongoAccessor extends MongoAccessor<Photo> implements PhotoAccessor {
  constructor() {
    super(PhotoMongoModel, new PhotoMongoDocumentSerializer(config.photoStorage));
  }

  private async writePhoto(photo: Photo) {
    try {
      await util.promisify(fs.mkdir)(config.photoStorage);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
    
    const filename = `${config.photoStorage}/${photo.id}.${photo.mime.split('/')[1]}`;
    const writeStream = fs.createWriteStream(filename);
    photo.readableStream.pipe(writeStream);

    await util.promisify(writeStream.on.bind(writeStream, 'finish'))();

    await util.promisify(fs.stat)(filename);
    photo.readableStream = fs.createReadStream(filename);
  }

  async insert(object: Photo): Promise<Photo> {
    await this.writePhoto(object);
    const photo: Photo = await super.insert(object);
    return photo;
  }

  async update(object: Photo): Promise<Photo> {
    await this.writePhoto(object);
    const photo: Photo = await super.update(object);
    return photo;
  }

}