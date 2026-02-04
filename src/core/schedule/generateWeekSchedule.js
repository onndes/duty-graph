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

export function generateWeekSchedule({
  people,
  weekStart,
  history = [],
  overrides = [],
  shiftsPerDay = 1,
  rotationOffset = 0,
}) {
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

  // --- 1. считаем авто-графики из истории ---
  history.forEach((schedule) => {
    Object.entries(schedule.assignments).forEach(([date, peopleIds]) => {
      peopleIds.forEach((personId) => {
        if (!statsByPerson[personId]) return;

        statsByPerson[personId].totalShifts += 1;
        statsByPerson[personId].lastShiftDate = statsByPerson[personId].lastShiftDate
          ? Math.max(statsByPerson[personId].lastShiftDate, date)
          : date;
      });
    });
  });

  // --- 2. применяем overrides ---
  overrides.forEach((o) => {
    const stats = statsByPerson[o.personId];
    if (!stats) return;

    if (o.type === 'remove') {
      stats.totalShifts = Math.max(0, stats.totalShifts - 1);
    }

    if (o.type === 'add') {
      stats.totalShifts += 1;
      stats.lastShiftDate = stats.lastShiftDate ? Math.max(stats.lastShiftDate, o.date) : o.date;
    }

    if (o.type === 'unavailable') {
      stats.unavailableDays.add(o.date);
    }
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

          // если есть история — НЕ используем rotationOffset
          if (history.length > 0) {
            return 0;
          }

          // fallback: чистая лестница ТОЛЬКО для первой недели
          const aIndex = people.findIndex((p) => p.id === a.person.id);
          const bIndex = people.findIndex((p) => p.id === b.person.id);

          return (
            ((aIndex - dayIndex + people.length) % people.length) -
            ((bIndex - dayIndex + people.length) % people.length)
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
