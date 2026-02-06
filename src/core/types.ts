export type ISODate = string; // format YYYY-MM-DD
export type WeekStartDate = ISODate;
export type Assignments = Record<ISODate, number[]>;

export type OverrideType = 'add' | 'remove' | 'unavailable';

export type Override = {
  personId: number; // id of the person
  date: ISODate;
  type: OverrideType;
};

export type Person = {
  id: number; // 0, 1, 2, ...
  fullName: string; // Alex Johnson
  note?: string; // optional note about the person
};

export type Schedule = {
  weekStart: WeekStartDate; // date of the Monday of the week, format YYYY-MM-DD
  createdAt: number; // timestamp in milliseconds
  assignments: Assignments; // { '2023-10-02': [personId, personId], ... }
  rotationOffset?: number;
};

export type GenerateArgs = {
  people: Person[];
  weekStart: WeekStartDate;
  history?: Schedule[];
  overrides?: Override[];
  shiftsPerDay?: number;
  rotationOffset?: number;
};

export type PersonStats = {
  totalShifts: number;
  lastShiftDate: ISODate | null;
  unavailableDays: Set<ISODate>;
};
