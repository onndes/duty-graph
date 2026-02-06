import { db } from './index';
import { WeekStartDate } from '../core/types';
import { OverrideDB, OverrideInput } from './types';

// add new override (force / block)
export function addOverride({ weekStart, personId, date, type }: OverrideInput): Promise<number> {
  return db.overrides.add({
    weekStart,
    personId,
    date,
    type,
    createdAt: Date.now(),
  });
}

// get all overrides for a week
export function getOverridesByWeek(weekStart: WeekStartDate): Promise<OverrideDB[]> {
  return db.overrides.where('weekStart').equals(weekStart).toArray();
}

// remove override (e.g., cancellation)
export function removeOverride(id: number): Promise<void> {
  return db.overrides.delete(id);
}
