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

const MAX_SHIFTS_PER_DAY = 1;

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
 * Finds the nearest available day index for assignment.
 *
 * Uses symmetric search around the preferred day:
 * 0, +1, -1, +2, -2, ...
 */
function findAvailableDayIndex(
  preferredDayIndex: number,
  days: ISODate[],
  assignments: Assignments
): number | null {
  const totalDays = days.length;

  for (let offset = 0; offset < totalDays; offset++) {
    const candidates =
      offset === 0
        ? [preferredDayIndex]
        : [
            (preferredDayIndex + offset) % totalDays,
            (preferredDayIndex - offset + totalDays) % totalDays,
          ];

    for (const dayIndex of candidates) {
      const day = days[dayIndex];
      if (assignments[day].length < MAX_SHIFTS_PER_DAY) {
        return dayIndex;
      }
    }
  }

  return null;
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
  rotationSeed,
}: {
  people: Person[];
  participantStates: ParticipantState[];
  weekStart: WeekStartDate;
  rotationSeed: number;
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

  const activeStates = participantStates
    .filter((state) => state.active)
    .sort((a, b) => a.personId - b.personId);

  // Apply rotation seed to change processing order between weeks
  const rotatedStates = [
    ...activeStates.slice(rotationSeed % activeStates.length),
    ...activeStates.slice(0, rotationSeed % activeStates.length),
  ];

  /**
   * Logical day rotation (Variant 2).
   *
   * Rules:
   * - If participant has lastDayIndex → keep the same logical day
   * - If not → assign sequentially from Monday (index 0)
   */
  let fallbackIndex = 0;

  activeStates.forEach((state) => {
    let preferredDayIndex: number;

    if (state.lastDayIndex !== null) {
      preferredDayIndex = state.lastDayIndex;
    } else {
      preferredDayIndex = fallbackIndex % days.length;
      fallbackIndex += 1;
    }

    const resolvedDayIndex = findAvailableDayIndex(preferredDayIndex, days, assignments);

    if (resolvedDayIndex === null) {
      // No available slot in this week (should not happen with sane limits)
      return;
    }

    const day = days[resolvedDayIndex];
    assignments[day].push(state.personId);
  });

  return {
    weekStart,
    createdAt: Date.now(),
    assignments,
  };
}
