import { db } from './index';

export function setMeta(key, value) {
  return db.meta.put({ key, value });
}

export function getMeta(key) {
  return db.meta.get(key);
}
