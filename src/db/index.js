import Dexie from 'dexie';

export const db = new Dexie('DutyGraphDB');

db.version(1).stores({
  participants: '++id',
  schedules: 'weekStart, createdAt',
});
