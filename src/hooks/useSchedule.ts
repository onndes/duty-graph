import { useEffect, useRef, useState } from 'react';

import { getParticipants } from '../db/participants';
import { saveSchedule, getScheduleByWeek, getScheduleHistory } from '../db/schedules';
import { getOverridesByWeek } from '../db/overrides';
import { getMeta, setMeta } from '../db/meta';
import { seedParticipants } from '../db/devSeed';

import { generateWeekSchedule } from '../core/schedule/generateWeekSchedule';
import { applyOverrides } from '../core/schedule/applyOverrides';

import createEmptySchedule from '../logic/createEmptySchedule';

import type { Person, Schedule, WeekStartDate } from '../core/types';
import type { ParticipantDB } from '../db/types';

/**
 * Черновик графика (ещё не сохранён в БД)
 */
type DraftSchedule = {
  weekStart: WeekStartDate;
  assignments: Schedule['assignments'];
  isEmpty: true;
};

type ScheduleState = Schedule | DraftSchedule | null;

export function useSchedule() {
  const [people, setPeople] = useState<Person[]>([]);
  const [schedule, setSchedule] = useState<ScheduleState>(null);
  const [history, setHistory] = useState<Schedule[]>([]);
  const [dragItem, setDragItem] = useState<number | null>(null);

  const seededRef = useRef<boolean>(false);

  // --- init (ТОЛЬКО один раз) ---
  useEffect(() => {
    if (!seededRef.current) {
      seededRef.current = true;
      seedParticipants();
    }

    getParticipants().then((rows: ParticipantDB[]) => {
      const mapped: Person[] = rows
        .filter((p): p is ParticipantDB & { id: number } => typeof p.id === 'number')
        .map((p) => ({
          id: p.id,
          fullName: p.fullName,
          note: p.note,
        }));

      setPeople(mapped);
    });

    getScheduleHistory().then(setHistory);
  }, []);

  // --- загрузка графика по неделе ---
  const loadScheduleForWeek = async (weekStart: WeekStartDate): Promise<void> => {
    const storedSchedule = await getScheduleByWeek(weekStart);

    if (!storedSchedule) {
      setSchedule(createEmptySchedule(weekStart) as DraftSchedule);
      return;
    }

    const overrides = await getOverridesByWeek(weekStart);
    const finalSchedule = applyOverrides(storedSchedule, overrides);

    setSchedule(finalSchedule);
  };

  // --- создание графика ---
  const createSchedule = async (weekStart: WeekStartDate): Promise<void> => {
    if (!people.length) return;

    const existing = await getScheduleByWeek(weekStart);
    if (existing) {
      setSchedule(existing);
      return;
    }

    const meta = await getMeta<number>('rotationOffset');
    const rotationOffset = meta?.value ?? 0;

    const newSchedule = generateWeekSchedule({
      people,
      weekStart,
      history,
      overrides: await getOverridesByWeek(weekStart),
      rotationOffset,
    });

    await saveSchedule(newSchedule);

    await setMeta<number>('rotationOffset', rotationOffset + 1);

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
