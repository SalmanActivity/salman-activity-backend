import Accessor from './accessor'
import Item from './item'

export default class InMemoryAccessor<T extends Item> implements Accessor<T> {

  constructor(protected documents: T[]) {
  }

  async getAll(): Promise<T[]> {
    return this.documents
  }

  async getById(id: string): Promise<T> {
    for (let item of this.documents)
      if (item.id === id)
        return item
    return undefined  
  }

  async insert(object: T): Promise<T> {
    let obj = Object.assign({}, object)
    let otherObject = await this.getById(obj.id)
    if (otherObject)
      throw new Error('object id taken')
    otherObject = await this.getById(obj.id)
    while (!obj.id || otherObject) {
      let hex = '0123456789abcdef'
      obj.id = ''
      for (let i = 0; i < 24; i++)
        obj.id += hex[Math.floor(Math.random() * hex.length)]
      otherObject = await this.getById(obj.id)
    }
    this.documents.push(obj)
    return obj
  }

  async deleteAll(): Promise<void> {
    while (this.documents.length > 0)
      this.documents.pop()
  }

  async delete(object: T): Promise<T> {
    for (let i = 0; i < this.documents.length; i++) {
      let item = this.documents[i]
      if (item.id === object.id) {
        this.documents.splice(i,1)
        return item
      }
    }
    throw new Error('document not found')
  }

  async update(object: T): Promise<T> {
    for (let i = 0; i < this.documents.length; i++) {
      let item = this.documents[i]
      if (item.id === object.id) {
        this.documents[i] = object
        return this.documents[i]
      }
    }
    throw new Error('document not found')  
  }

}