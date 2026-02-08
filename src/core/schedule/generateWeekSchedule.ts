import type { ParticipantState } from '../../db/types';
import type { Assignments, ISODate, Person, WeekStartDate } from '../types';

/**
 * Weekly schedule generator.
 *
 * ARCHITECTURAL RULES:
 * - Uses ParticipantState as the ONLY source of truth
 * - Does NOT use schedule history
 * - Does NOT use overrides
 * - Does NOT mutate database state
 *
 * Schedule history is an archive and must never affect generation.
 *
 * Current implementation is intentionally simple and deterministic.
 * It will be extended step-by-step in later stages.
 */

/**
 * Returns ISO dates (yyyy-mm-dd) for the given week start.
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
 * Initializes empty assignments for the week.
 */
function initAssignments(days: ISODate[]): Assignments {
  const assignments: Assignments = {};
  days.forEach((day) => {
    assignments[day] = [];
  });
  return assignments;
}

/**
 * Generates a weekly duty schedule.
 *
 * TEMPORARY LOGIC:
 * - Assigns active participants sequentially across days
 * - One participant per day
 * - Stable and predictable output
 */
export function generateWeekSchedule({
  people,
  participantStates,
  weekStart,
}: {
  people: Person[];
  participantStates: ParticipantState[];
  weekStart: WeekStartDate;
}): {
  weekStart: WeekStartDate;
  createdAt: number;
  assignments: Assignments;
} {
  if (!weekStart) {
    throw new Error('weekStart is required');
  }

  const days = getWeekDays(weekStart);
  const assignments = initAssignments(days);

  // Use ONLY active participant states
  const activeStates = participantStates
    .filter((state) => state.active)
    .sort((a, b) => a.personId - b.personId);

  // Temporary naive assignment logic
  activeStates.forEach((state, index) => {
    const dayIndex = index % days.length;
    const day = days[dayIndex];
    assignments[day].push(state.personId);
  });

  return {
    weekStart,
    createdAt: Date.now(),
    assignments,
  };
}
