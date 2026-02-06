import { ISODate, WeekStartDate, Assignments } from '../core/types';

export type OverrideKind = 'force' | 'block';

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
