import {
  Schedule,
  WeekStartDate,
  Assignments,
  ISODate,
  PersonStats,
  GenerateArgs,
  Person,
} from '../types';

// вычисление штрафов для кандидатов и генерация расписания на неделю

// вычисление штрафа для кандидата на конкретный день
function calculatePenalty({ stats, date }: { stats: PersonStats; date: ISODate }): number {
  // 1. основной критерий — сколько всего дежурств
  let penalty = stats.totalShifts;

  // 2. мягкий штраф, если дежурил совсем недавно
  if (stats.lastShiftDate) {
    const daysSince =
      (new Date(date).getTime() - new Date(stats.lastShiftDate).getTime()) / (1000 * 60 * 60 * 24);

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

// получить все дни недели, начиная с weekStart (понедельник)
function getWeekDays(weekStart: WeekStartDate): ISODate[] {
  // проверяем наличие weekStart
  if (!weekStart) {
    throw new Error('getWeekDays: weekStart is empty');
  }

  // проверяем валидность даты
  const start = new Date(weekStart);
  if (isNaN(start.getTime())) {
    throw new Error(`getWeekDays: invalid date "${weekStart}"`);
  }

  // генерируем 7 дней недели
  const result: ISODate[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    // console.log(d);
    d.setDate(start.getDate() + i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

export function generateWeekSchedule({
  people,
  weekStart,
  history = [],
  overrides = [],
  shiftsPerDay = 1,
  rotationOffset = 0,
}: GenerateArgs): Schedule {
  if (!weekStart) {
    throw new Error('weekStart is required');
  }

  const days = getWeekDays(weekStart); // получаем все дни недели, начиная с weekStart (понедельник)

  const assignments: Assignments = {}; // { '2023-10-02': [personId, personId], ... }
  // assignments — назначения на неделю
  const statsByPerson: Record<number, PersonStats> = {}; // { personId: { totalShifts , lastShiftDate, unavailableDays: Set }, ... }
  // totalShifts — всего дежурств
  // lastShiftDate — дата последнего дежурства
  // unavailableDays — Set с датами недоступности

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

        // обновляем общее количество дежурств
        statsByPerson[personId].totalShifts += 1;
        // обновляем дату последнего дежурства, если она есть, и она больше текущей, или если её нет, то ставим текущую
        // А почему текущую? Потому что мы проходим по истории в порядке от старых графиков к новым, и нам нужно, чтобы в итоге осталась самая последняя дата
        // И да, это может быть не совсем точно, если графики в истории были созданы не в хронологическом порядке, но мы предполагаем, что это не так, и что графики создаются последовательно каждую неделю
        statsByPerson[personId].lastShiftDate =
          !statsByPerson[personId].lastShiftDate || date > statsByPerson[personId].lastShiftDate
            ? date
            : statsByPerson[personId].lastShiftDate;
      });
    });
  });

  // --- 2. применяем overrides ---
  overrides.forEach((o) => {
    const stats = statsByPerson[o.personId];
    // stats может не быть, если оверрайд на несуществующего человека

    if (!stats) return;

    // обновляем статистику в зависимости от типа оверрайда
    // уменьшаем общее количество дежурств
    if (o.type === 'remove') {
      stats.totalShifts = Math.max(0, stats.totalShifts - 1);
    }

    // увеличиваем общее количество дежурств и обновляем дату последнего дежурства
    if (o.type === 'add') {
      stats.totalShifts += 1;
      stats.lastShiftDate =
        !stats.lastShiftDate || o.date > stats.lastShiftDate ? o.date : stats.lastShiftDate;
    }

    // добавляем дату в недоступные дни
    if (o.type === 'unavailable') {
      stats.unavailableDays.add(o.date);
    }
  });

  // --- 3. генерируем назначения на неделю ---
  days.forEach((day, dayIndex) => {
    assignments[day] = [];

    // для каждого дня сортируем кандидатов по штрафу и выбираем лучших
    // shiftsPerDay — сколько дежурств в день нужно назначить, обычно 1
    for (let shift = 0; shift < shiftsPerDay; shift++) {
      // формируем список кандидатов
      const candidates = people
        .map((p) => {
          // p - кандидат, stats - его статистика, если её нет, то возвращаем null, чтобы отфильтровать этого кандидата
          const stats = statsByPerson[p.id];
          if (!stats) return null;

          return {
            person: p,
            // вычисляем штраф для кандидата на этот день
            penalty: calculatePenalty({
              stats: stats,
              date: day,
            }),
          };
        })
        // отфильтровываем тех, кто не может дежурить в этот день (штраф Infinity) и тех, кто уже назначен на этот день
        .filter(
          // c - кандидат с его штрафом, мы отфильтровываем тех, у кого штраф Infinity (недоступность) и тех, кто уже назначен на этот день (штраф Infinity из-за оверрайда add)
          (c): c is { person: Person; penalty: number } => c !== null && c.penalty !== Infinity
        )
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

          // сдвигаем индексы на dayIndex, чтобы каждый день недели начинался с нового человека
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
        if (!stats) return;
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
