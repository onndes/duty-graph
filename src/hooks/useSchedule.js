import { useEffect, useRef, useState } from 'react';
import { getParticipants } from '../db/participants';
import { saveSchedule, getScheduleByWeek, getScheduleHistory } from '../db/schedules';
import { generateWeekSchedule } from '../core/schedule/generateWeekSchedule';
import { getMeta, setMeta } from '../db/meta';
import { seedParticipants } from '../db/devSeed';
import createEmptySchedule from '../logic/createEmptySchedule';
import { applyOverrides } from '../core/schedule/applyOverrides';
import { getOverridesByWeek } from '../db/overrides';

export function useSchedule() {
  const [people, setPeople] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [history, setHistory] = useState([]);
  const [dragItem, setDragItem] = useState(null);

  const seededRef = useRef(false);

  // --- init (ТОЛЬКО один раз) ---
  useEffect(() => {
    if (!seededRef.current) {
      seededRef.current = true;
      seedParticipants();
    }

    getParticipants().then(setPeople);
    getScheduleHistory().then(setHistory);
  }, []);

  // --- загрузка графика по неделе ---
  const loadScheduleForWeek = async (weekStart) => {
    const schedule = await getScheduleByWeek(weekStart);

    if (!schedule) {
      setSchedule(createEmptySchedule(weekStart));
      return;
    }

    const overrides = await getOverridesByWeek(weekStart);
    const finalSchedule = applyOverrides(schedule, overrides);

    setSchedule(finalSchedule);
  };

  // --- создание графика ---
  const createSchedule = async (weekStart) => {
    if (!people.length || !weekStart) return;

    // 1. Проверяем: есть ли уже график для этой недели
    const existing = await getScheduleByWeek(weekStart);
    if (existing) {
      // График уже есть — просто показываем его
      setSchedule(existing);
      return;
    }

    // 2. Берём rotationOffset ТОЛЬКО для новой недели
    const meta = await getMeta('rotationOffset');
    const rotationOffset = meta?.value || 0;

    // 3. Генерируем новый график
    const newSchedule = generateWeekSchedule({
      people,
      weekStart,
      history,
      overrides: await getOverridesByWeek(weekStart),
      rotationOffset,
    });

    // 4. Сохраняем
    await saveSchedule(newSchedule);

    // 5. Увеличиваем offset ТОЛЬКО потому что неделя новая
    await setMeta('rotationOffset', rotationOffset + 1);

    // 6. Обновляем состояние
    setSchedule(newSchedule);
    getScheduleHistory().then(setHistory);
  };

  return {
    people,
    schedule,
    history,
    dragItem,
    setDragItem,
    setSchedule,
    loadScheduleForWeek,
    createSchedule,
  };
}
