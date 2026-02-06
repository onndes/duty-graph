import { db } from './index';
import { MetaDB } from './types';

export type MetaKey = MetaDB['key'];

/**
 * Получить значение из meta-хранилища.
 * Тип значения задаётся в месте вызова (через generic),
 * но реально хранится как unknown в БД.
 */
export async function getMeta<T = unknown>(
  key: MetaKey
): Promise<{ key: MetaKey; value: T } | undefined> {
  const record = await db.meta.get(key);
  if (!record) return undefined;

  return record as { key: MetaKey; value: T };
}

/**
 * Сохранить значение в meta-хранилище.
 */
export function setMeta<T>(key: MetaKey, value: T): Promise<MetaKey> {
  return db.meta.put({ key, value });
}
