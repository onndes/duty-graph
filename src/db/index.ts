import Dexie, { Table } from 'dexie';
import { ParticipantDB, ScheduleDB, OverrideDB, MetaDB, ParticipantState } from './types';

export class DutyGraphDB extends Dexie {
  participants!: Table<ParticipantDB, number>;
  schedules!: Table<ScheduleDB, string>;
  overrides!: Table<OverrideDB, number>;
  participantStates!: Table<ParticipantState, number>;
  meta!: Table<MetaDB, string>;

  constructor() {
    super('DutyGraphDB');

    this.version(2).stores({
      participants: '++id',
      schedules: 'weekStart, createdAt',
      overrides: '++id, weekStart, personId, date',
      participantStates: 'personId, active, updatedAt',
      meta: 'key',
    });
  }
}

export const db = new DutyGraphDB();
