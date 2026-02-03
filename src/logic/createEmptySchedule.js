/* eslint-disable no-unused-vars */
function createEmptySchedule(weekStart, people) {
  const days = [];

  const start = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }

  const assignments = {};
  days.forEach((day) => {
    assignments[day] = [];
  });

  return {
    weekStart,
    assignments,
    isEmpty: true, // 👈 флаг, что это НЕ сохранённый график
  };
}

export default createEmptySchedule;
