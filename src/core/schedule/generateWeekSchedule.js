export function generateWeekSchedule({ people, weekStart, shiftsPerDay = 1 }) {
  if (!weekStart) {
    throw new Error('weekStart is required');
  }

  const days = getWeekDays(weekStart);
  const assignments = {};

  let index = 0;

  days.forEach((day) => {
    assignments[day] = [];

    for (let i = 0; i < shiftsPerDay; i++) {
      const person = people[index % people.length];
      assignments[day].push(person.id);
      index++;
    }
  });

  return {
    weekStart,
    createdAt: Date.now(),
    assignments,
  };
}

/**
 * Возвращает массив из 7 дней недели
 * начиная с понедельника
 * в формате YYYY-MM-DD
 */
function getWeekDays(weekStart) {
  const result = [];
  const start = new Date(weekStart);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    result.push(d.toISOString().slice(0, 10));
  }

  return result;
}
