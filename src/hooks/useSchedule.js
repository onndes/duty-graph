import { useEffect, useRef, useState } from 'react';
import { getParticipants } from '../db/participants';
import { saveSchedule, getScheduleByWeek, getScheduleHistory } from '../db/schedules';
import { generateWeekSchedule } from '../core/schedule/generateWeekSchedule';
import { getMeta, setMeta } from '../db/meta';
import { seedParticipants } from '../db/devSeed';
import createEmptySchedule from '../logic/createEmptySchedule';

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
    const existing = await getScheduleByWeek(weekStart);
    setSchedule(existing || createEmptySchedule(weekStart));
  };

  // --- создание графика ---
  const createSchedule = async (weekStart) => {
    if (!people.length) return;

    const meta = await getMeta('rotationOffset');
    const rotationOffset = meta?.value || 0;

    const newSchedule = generateWeekSchedule({
      people,
      weekStart,
      rotationOffset,
    });

    await saveSchedule(newSchedule);
    await setMeta('rotationOffset', rotationOffset + 1);

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
