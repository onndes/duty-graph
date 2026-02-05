import { db } from './index';

// сохранить/добавить график
export function saveSchedule(schedule) {
  return db.schedules.put(schedule);
}

// получить неделю
export function getScheduleByWeek(weekStart) {
  return db.schedules.get(weekStart);
}

// список недель
export function getScheduleHistory() {
  return db.schedules.orderBy('weekStart').reverse().toArray();
}

export async function setOverride(
  weekStart,
  date,
  participantId,
  type // "force" | "block"
) {
  const schedule = await db.schedules.get(weekStart);

  if (!schedule) return;

  if (!schedule.overrides) {
    schedule.overrides = {};
  }

  if (!schedule.overrides[date]) {
    schedule.overrides[date] = { force: [], block: [] };
  }

  schedule.overrides[date].force = schedule.overrides[date].force.filter(
    (id) => id !== participantId
  );

  schedule.overrides[date].block = schedule.overrides[date].block.filter(
    (id) => id !== participantId
  );

  if (type) {
    schedule.overrides[date][type].push(participantId);
  }

  return db.schedules.put(schedule);
}
