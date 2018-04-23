import Item from './item';

export default interface Accessor<T extends Item> {

  getAll(): Promise<T[]>;

  getById(id:string): Promise<T>;

  insert(object: T): Promise<T>;

  deleteAll(): Promise<void>;

  delete(object: T): Promise<T>;

  update(object: T): Promise<T>;

}