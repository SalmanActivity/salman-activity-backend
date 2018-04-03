import { Accessor } from './accessor'
import Item from './item'

export default class InMemoryAccessor<T extends Item> implements Accessor<T> {

  constructor(private documents: T[]) {
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
    if (this.getById(obj.id))
      throw new Error('object id taken')
    while (!obj.id || this.getById(obj.id)) {
      let hex = '0123456789abcdef'
      obj.id = new Array(24 + 1).map(() => hex[Math.floor(Math.random()*hex.length)]).join('')
    }
    this.documents.push(obj)
    return obj
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

  update(object: T): Promise<T> {
    for (let i = 0; i < this.documents.length; i++) {
      let item = this.documents[i]
      if (item.id === object.id)
        this.documents[i] = object
    }
    throw new Error('document not found')  
  }

}