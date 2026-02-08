import { getParticipants } from './participants'; // твоя функция
import { upsertParticipantState, getParticipantState } from './participantStates';
import { ParticipantState } from './types';

export async function seedParticipantStates() {
  const people = await getParticipants();

  for (const p of people) {
    const existing = await getParticipantState(p.id);
    if (existing) continue;

    const state: ParticipantState = {
      personId: p.id,
      active: true,
      lastAssignedDate: null,
      lastDayIndex: null,
      totalShifts: 0,
      shiftDebt: 0,
      badDayDebt: 0,
      updatedAt: Date.now(),
    };

    await upsertParticipantState(state);
  }
}
