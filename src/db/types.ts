import { ISODate, WeekStartDate, Assignments } from '../core/types';

export type OverrideKind = 'force' | 'block';
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type ScheduleOverrideMap = Record<
  ISODate,
  {
    force: number[];
    block: number[];
  }
>;

export type ParticipantDB = {
  id?: number;
  fullName: string;
  note?: string;
  blockedDays: ISODate[];
  preferredDays: ISODate[];
};

export type ScheduleDB = {
  weekStart: WeekStartDate;
  createdAt: number;
  assignments: Assignments;
  rotationOffset?: number;
};

export type OverrideDB = {
  id?: number;
  weekStart: WeekStartDate;
  personId: number;
  date: ISODate;
  type: 'add' | 'remove' | 'unavailable';
  createdAt: number;
};

export type MetaDB = {
  key: string;
  value: unknown;
  
};

export type OverrideInput = {
  weekStart: WeekStartDate;
  personId: number;
  date: ISODate;
  type: OverrideDB['type']; // 'add' | 'remove' | 'unavailable'
};

export interface ParticipantState {
  personId: number;

  active: boolean; // участвует ли в графике
  lastAssignedDate: string | null; // ISO yyyy-mm-dd
  lastDayIndex: DayIndex | null; // логический день (0..6)

  totalShifts: number; // сколько дежурств всего
  shiftDebt: number; // долг по количеству
  badDayDebt: number; // долг по плохим дням

  updatedAt: number; // Date.now()
}
