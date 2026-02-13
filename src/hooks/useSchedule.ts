import { useEffect, useRef, useState } from 'react';

import { devInit } from '../dev/devInit';

import { getParticipants } from '../db/participants';
import { saveSchedule, getScheduleByWeek, getScheduleHistory } from '../db/schedules';
import { getOverridesByWeek } from '../db/overrides';
import { getAllParticipantStates, upsertParticipantState } from '../db/participantStates';

import { generateWeekSchedule } from '../core/schedule/generateWeekSchedule';
import { applyOverrides } from '../core/schedule/applyOverrides';
import { resetInactiveParticipantStates } from '../core/schedule/resetParticipantStates';

import createEmptySchedule from '../logic/createEmptySchedule';

import type { Person, Schedule, WeekStartDate } from '../core/types';
import type { DayIndex, ParticipantDB } from '../db/types';
import { getMeta } from '../db/meta';

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
      devInit();
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

    // Reset participant states if inactive for too long
    await resetInactiveParticipantStates();

    // Load current participant states (source of truth)
    const allStates = await getAllParticipantStates();

    // Only active participants can be scheduled
    const activeStates = allStates.filter((state) => state.active);
    const meta = await getMeta<number>('rotationSeed');
    const rotationSeed = meta?.value ?? 0;
    const newSchedule = generateWeekSchedule({
      people,
      participantStates: activeStates,
      weekStart,
      rotationSeed,
    });

    await saveSchedule(newSchedule);

    // Update participant states after schedule generation
    for (const [date, personIds] of Object.entries(newSchedule.assignments)) {
      // JS: Sun=0 .. Sat=6
      const jsDayIndex = new Date(date).getDay();
      // Normalize to Mon=0 .. Sun=6
      const dayIndex = ((jsDayIndex + 6) % 7) as DayIndex;

      for (const personId of personIds) {
        const state = activeStates.find((s) => s.personId === personId);
        if (!state) continue;

        state.lastAssignedDate = date;
        state.lastDayIndex = dayIndex;
        state.totalShifts += 1;
        state.updatedAt = Date.now();

        await upsertParticipantState(state);
      }
    }

    setSchedule(newSchedule);

    // reload history for UI
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
