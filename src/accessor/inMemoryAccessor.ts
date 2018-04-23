import { Accessor } from './accessor';
import { Item } from './item';

/**
 * Kelas ini merupakan implementasi dari interface Accessor yang melakukan penyimpanan object di memory aplikasi.
 * Kelas ini banyak digunakan untuk melakukan testing dengan berperan sebagai mock object dari accessor. 
 */
export class InMemoryAccessor<T extends Item> implements Accessor<T> {

  /**
   * Digunakan untuk membuat Accessor pada memory dengan dokumen awal sesuai parameter.
   * @param documents object awal yang ada di dalam penyimpanan.
   */
  constructor(protected documents: T[]) {
  }

  async getAll(): Promise<T[]> {
    return this.documents;
  }

  async getById(id: string): Promise<T> {
    for (const item of this.documents) {
      if (item.id === id) {
        return item;
      }
    }
    return undefined;  
  }

  async insert(object: T): Promise<T> {
    const obj = Object.assign({}, object);
    let otherObject = await this.getById(obj.id);
    if (otherObject) {
      throw new Error('object id taken');
    }
    otherObject = await this.getById(obj.id);
    while (!obj.id || otherObject) {
      const hex = '0123456789abcdef';
      obj.id = '';
      for (let i = 0; i < 24; i++) {
        obj.id += hex[Math.floor(Math.random() * hex.length)];
      }
      otherObject = await this.getById(obj.id);
    }
    this.documents.push(obj);
    return obj;
  }

  async deleteAll(): Promise<void> {
    while (this.documents.length > 0) {
      this.documents.pop();
    }
  }

  async delete(object: T): Promise<T> {
    for (let i = 0; i < this.documents.length; i++) {
      const item = this.documents[i];
      if (item.id === object.id) {
        this.documents.splice(i,1);
        return item;
      }
    }
    throw new Error('document not found');
  }

  async update(object: T): Promise<T> {
    for (let i = 0; i < this.documents.length; i++) {
      const item = this.documents[i];
      if (item.id === object.id) {
        this.documents[i] = object;
        return this.documents[i];
      }
    }
    throw new Error('document not found');  
  }

}