// Функция для получения даты понедельника недели
export default function getMonday(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().slice(0, 10);
}
