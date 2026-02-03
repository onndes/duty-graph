export function generateWeekSchedule({ people, weekStart, shiftsPerDay = 1, rotationOffset = 0 }) {
  if (!weekStart) {
    throw new Error('weekStart is required');
  }

  const days = getWeekDays(weekStart);
  const assignments = {};
  const totalPeople = people.length;

  days.forEach((day, dayIndex) => {
    assignments[day] = [];

    for (let shift = 0; shift < shiftsPerDay; shift++) {
      const index = (rotationOffset + dayIndex + shift * days.length) % totalPeople;

      assignments[day].push(people[index].id);
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
  const result = [];
  const start = new Date(weekStart);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    result.push(d.toISOString().slice(0, 10));
  }

  return result;
}
