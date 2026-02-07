import {
  Schedule,
  WeekStartDate,
  Assignments,
  ISODate,
  PersonStats,
  GenerateArgs,
  Person,
} from '../types';

/**
 * ============================
 *  Penalty calculation
 * ============================
 */

function calculatePenalty({ stats, date }: { stats: PersonStats; date: ISODate }): number {
  let penalty = stats.totalShifts;

  // мягкий штраф за недавнее дежурство
  if (stats.lastShiftDate) {
    const daysSince =
      (new Date(date).getTime() - new Date(stats.lastShiftDate).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSince < 7) {
      penalty += 1;
    }
  }

  // недоступность — полный запрет
  if (stats.unavailableDays.has(date)) {
    return Infinity;
  }

  return penalty;
}

/**
 * ============================
 *  Date helpers
 * ============================
 */

function getWeekDays(weekStart: WeekStartDate): ISODate[] {
  const start = new Date(weekStart);
  if (isNaN(start.getTime())) {
    throw new Error(`Invalid weekStart: ${weekStart}`);
  }

  const days: ISODate[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getTime());
    d.setDate(start.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }

  return days;
}

/**
 * ============================
 *  Initialization
 * ============================
 */

function initAssignments(days: ISODate[]): Assignments {
  const assignments: Assignments = {};
  days.forEach((d) => (assignments[d] = []));
  return assignments;
}

function initStats(people: Person[]): Record<number, PersonStats> {
  const stats: Record<number, PersonStats> = {};

  people.forEach((p) => {
    stats[p.id] = {
      totalShifts: 0,
      lastShiftDate: null,
      unavailableDays: new Set(),
    };
  });

  return stats;
}

/**
 * ============================
 *  History & overrides
 * ============================
 */

function applyHistory(statsByPerson: Record<number, PersonStats>, history: Schedule[]): void {
  history.forEach((schedule) => {
    Object.entries(schedule.assignments).forEach(([date, peopleIds]: [ISODate, number[]]) => {
      peopleIds.forEach((id) => {
        const stats = statsByPerson[id];
        if (!stats) return;

        stats.totalShifts += 1;
        stats.lastShiftDate =
          !stats.lastShiftDate || date > stats.lastShiftDate ? date : stats.lastShiftDate;
      });
    });
  });
}

function applyOverrides(
  statsByPerson: Record<number, PersonStats>,
  overrides: GenerateArgs['overrides']
): void {
  if (!overrides) return;

  overrides.forEach((o) => {
    const stats = statsByPerson[o.personId];
    if (!stats) return;

    switch (o.type) {
      case 'remove':
        stats.totalShifts = Math.max(0, stats.totalShifts - 1);
        break;

      case 'add':
        stats.totalShifts += 1;
        stats.lastShiftDate =
          !stats.lastShiftDate || o.date > stats.lastShiftDate ? o.date : stats.lastShiftDate;
        break;

      case 'unavailable':
        stats.unavailableDays.add(o.date);
        break;
    }
  });
}

/**
 * ============================
 *  Ladder position helper
 * ============================
 */

function ladderPosition(personIndex: number, dayIndex: number, total: number): number {
  return (personIndex - dayIndex + total) % total;
}

/**
 * ============================
 *  Assignment logic
 * ============================
 */

function getCandidates({
  day,
  dayIndex,
  people,
  statsByPerson,
  history,
}: {
  day: ISODate;
  dayIndex: number;
  people: Person[];
  statsByPerson: Record<number, PersonStats>;
  history: Schedule[];
}): { person: Person; penalty: number }[] {
  const candidates: { person: Person; penalty: number }[] = [];

  // 1. Проходим по всем людям и отбираем допустимых
  for (const person of people) {
    const stats = statsByPerson[person.id];
    if (!stats) continue;

    const penalty = calculatePenalty({ stats, date: day });
    if (penalty === Infinity) continue;

    candidates.push({ person, penalty });
  }

  // 2. Сортируем кандидатов
  candidates.sort((a, b) => {
    // основной критерий — минимальный штраф
    if (a.penalty !== b.penalty) {
      return a.penalty - b.penalty;
    }

    // если есть история — порядок не важен
    if (history.length > 0) {
      return 0;
    }

    // fallback: лестница для первой недели
    const aIndex = people.findIndex((p) => p.id === a.person.id);
    const bIndex = people.findIndex((p) => p.id === b.person.id);

    return (
      ladderPosition(aIndex, dayIndex, people.length) -
      ladderPosition(bIndex, dayIndex, people.length)
    );
  });

  return candidates;
}

function assignWeek({
  days,
  people,
  assignments,
  statsByPerson,
  shiftsPerDay,
  history,
}: {
  days: ISODate[];
  people: Person[];
  assignments: Assignments;
  statsByPerson: Record<number, PersonStats>;
  shiftsPerDay: number;
  history: Schedule[];
}): void {
  days.forEach((day, dayIndex) => {
    for (let shift = 0; shift < shiftsPerDay; shift++) {
      const candidates = getCandidates({
        day,
        dayIndex,
        people,
        statsByPerson,
        history,
      });

      const selected = candidates[0];
      if (!selected) return;

      assignments[day].push(selected.person.id);

      const stats = statsByPerson[selected.person.id];
      if (!stats) return;

      stats.totalShifts += 1;
      stats.lastShiftDate = day;
    }
  });
}

/**
 * ============================
 *  Public API
 * ============================
 */

export function generateWeekSchedule({
  people,
  weekStart,
  history = [],
  overrides = [],
  shiftsPerDay = 1,
  rotationOffset,
}: GenerateArgs): Schedule {
  if (!weekStart) {
    throw new Error('weekStart is required');
  }

  const days = getWeekDays(weekStart);

  const assignments = initAssignments(days);
  const statsByPerson = initStats(people);

  applyHistory(statsByPerson, history);
  applyOverrides(statsByPerson, overrides);

  assignWeek({
    days,
    people,
    assignments,
    statsByPerson,
    shiftsPerDay,
    history,
  });

  return {
    weekStart,
    createdAt: Date.now(),
    assignments,
    rotationOffset,
  };
}
