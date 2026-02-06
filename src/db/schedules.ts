import { db } from './index';
import { OverrideKind, ScheduleDB, ScheduleOverrideMap } from './types';
import { ISODate, WeekStartDate } from '../core/types';

// сохранить / добавить график
export function saveSchedule(schedule: ScheduleDB): Promise<string> {
  return db.schedules.put(schedule);
}

// получить график по неделе
export function getScheduleByWeek(weekStart: WeekStartDate): Promise<ScheduleDB | undefined> {
  return db.schedules.get(weekStart);
}

// список недель (история)
export function getScheduleHistory(): Promise<ScheduleDB[]> {
  return db.schedules.orderBy('weekStart').reverse().toArray();
}

// установить override (force / block)
export async function setOverride(
  weekStart: WeekStartDate,
  date: ISODate,
  participantId: number,
  type: OverrideKind | null
): Promise<void> {
  const schedule = await db.schedules.get(weekStart);
  if (!schedule) return;

  // локальное расширение модели — overrides не хранятся в DB-типе жёстко
  const overrides: ScheduleOverrideMap =
    (schedule as ScheduleDB & { overrides?: ScheduleOverrideMap }).overrides ?? {};

  if (!overrides[date]) {
    overrides[date] = { force: [], block: [] };
  }

  overrides[date].force = overrides[date].force.filter((id) => id !== participantId);
  overrides[date].block = overrides[date].block.filter((id) => id !== participantId);

  if (type) {
    overrides[date][type].push(participantId);
  }

  (schedule as ScheduleDB & { overrides: ScheduleOverrideMap }).overrides = overrides;

  await db.schedules.put(schedule);
}
