import { db } from './index';

// получить значение
export function getMeta(key) {
  return db.meta.get(key);
}

// сохранить значение
export function setMeta(key, value) {
  return db.meta.put({ key, value });
}
