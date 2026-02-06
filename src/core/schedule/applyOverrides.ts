import { ISODate, Override, Schedule } from '../types';

// Применяет ручные overrides поверх автоматического графика

export function applyOverrides(schedule: Schedule | null, overrides: Override[]): Schedule | null {
  if (!schedule) return schedule;

  // глубокая копия assignments
  const assignments: Record<string, number[]> = {};
  Object.entries(schedule.assignments).forEach(([day, people]) => {
    assignments[day] = [...people];
  });

  overrides.forEach((override) => {
    const { date, personId, type } = override;

    if (!assignments[date]) return;

    if (type === 'add') {
      if (!assignments[date].includes(personId)) {
        assignments[date].push(personId);
      }
    }

    if (type === 'remove') {
      assignments[date] = assignments[date].filter((id) => id !== personId);
    }

    if (type === 'unavailable') {
      assignments[date] = assignments[date].filter((id) => id !== personId);
    }
  });

  return {
    ...schedule,
    assignments,
  };
}
