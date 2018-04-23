import { Types } from "mongoose";

/**
 * Merupakan definisi object yang akan disimpan di mongo. Hal ini bersesuaian dengan object
 * Item akan tetapi atribut id nya berubah menjadi _id.
 */
export interface MongoItem {

  _id: Types.ObjectId | string;

}