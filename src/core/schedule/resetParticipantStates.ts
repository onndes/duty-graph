import { getAllParticipantStates, upsertParticipantState } from '../../db/participantStates';
import { getMeta } from '../../db/meta';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function resetInactiveParticipantStates() {
  const states = await getAllParticipantStates();

  const meta = await getMeta<number>('resetAfterDays');
  const resetAfterDays = meta?.value ?? 30;

  const now = Date.now();

  for (const state of states) {
    if (!state.lastAssignedDate) continue;

    const last = new Date(state.lastAssignedDate).getTime();
    const daysSince = Math.floor((now - last) / DAY_MS);

    if (daysSince >= resetAfterDays) {
      state.lastAssignedDate = null;
      state.lastDayIndex = null;
      state.totalShifts = 0;
      state.shiftDebt = 0;
      state.badDayDebt = 0;
      state.updatedAt = now;

      await upsertParticipantState(state);
    }
  }
}
