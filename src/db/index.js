import Dexie from 'dexie';

export const db = new Dexie('DutyGraphDB');

db.version(2).stores({
  participants: '++id',
  schedules: 'weekStart, createdAt',
  overrides: '++id, weekStart, personId, date',
  meta: 'key',
});
