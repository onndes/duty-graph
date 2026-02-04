import { db } from './index';

// добавить override
export function addOverride({ weekStart, personId, date, type }) {
  return db.overrides.add({
    weekStart,
    personId,
    date,
    type, // 'add' | 'remove' | 'unavailable'
    createdAt: Date.now(),
  });
}

// получить все overrides для недели
export function getOverridesByWeek(weekStart) {
  return db.overrides.where('weekStart').equals(weekStart).toArray();
}

// удалить override (например, отмена)
export function removeOverride(id) {
  return db.overrides.delete(id);
}
