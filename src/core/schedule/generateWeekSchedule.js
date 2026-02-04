function calculatePenalty({ stats, date }) {
  // 1. основной критерий — сколько всего дежурств
  let penalty = stats.totalShifts;

  // 2. мягкий штраф, если дежурил совсем недавно
  if (stats.lastShiftDate) {
    const daysSince = (new Date(date) - new Date(stats.lastShiftDate)) / (1000 * 60 * 60 * 24);

    if (daysSince < 7) {
      penalty += 1;
    }
  }

  // 3. недоступность — запрет
  if (stats.unavailableDays?.has(date)) {
    return Infinity;
  }

  return penalty;
}

export function generateWeekSchedule({ people, weekStart, shiftsPerDay = 1, rotationOffset = 0 }) {
  if (!weekStart) {
    throw new Error('weekStart is required');
  }

  const days = getWeekDays(weekStart);
  const assignments = {};
  const statsByPerson = {};
  people.forEach((p) => {
    statsByPerson[p.id] = {
      totalShifts: 0,
      lastShiftDate: null,
      unavailableDays: new Set(),
    };
  });
  days.forEach((day, dayIndex) => {
    assignments[day] = [];

    for (let shift = 0; shift < shiftsPerDay; shift++) {
      const candidates = people
        .map((p) => ({
          person: p,
          penalty: calculatePenalty({
            stats: statsByPerson[p.id],
            date: day,
          }),
        }))
        .filter((c) => c.penalty !== Infinity && !assignments[day].includes(c.person.id))
        .sort((a, b) => {
          if (a.penalty !== b.penalty) {
            return a.penalty - b.penalty;
          }

          // tie-breaker: лестничный сдвиг
          const aIndex = people.findIndex((p) => p.id === a.person.id);
          const bIndex = people.findIndex((p) => p.id === b.person.id);

          const offset = (rotationOffset + dayIndex) % people.length;

          return (
            ((aIndex - offset + people.length) % people.length) -
            ((bIndex - offset + people.length) % people.length)
          );
        });

      const selected = candidates[0]?.person;

      if (selected) {
        assignments[day].push(selected.id);

        // обновляем статистику
        const stats = statsByPerson[selected.id];
        stats.totalShifts += 1;
        stats.lastShiftDate = day;
      }
    }
  });

  return {
    weekStart,
    createdAt: Date.now(),
    assignments,
    rotationOffset, // сохраняем для истории
  };
}

function getWeekDays(weekStart) {
  if (!weekStart) {
    throw new Error('getWeekDays: weekStart is empty');
  }

  const start = new Date(weekStart);
  if (isNaN(start.getTime())) {
    throw new Error(`getWeekDays: invalid date "${weekStart}"`);
  }

  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    result.push(d.toISOString().slice(0, 10));
  }

  return result;
}
