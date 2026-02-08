import { db } from './index';
import { ParticipantState } from './types';

export async function getParticipantState(personId: number) {
  return db.participantStates.get(personId) as Promise<ParticipantState | undefined>;
}

export async function upsertParticipantState(state: ParticipantState) {
  return db.participantStates.put(state);
}

export async function getAllParticipantStates() {
  return db.participantStates.toArray() as Promise<ParticipantState[]>;
}

export async function setParticipantActive(personId: number, active: boolean) {
  const state = await getParticipantState(personId);
  if (!state) return;
  state.active = active;
  state.updatedAt = Date.now();
  return upsertParticipantState(state);
}

export async function deactivateParticipant(personId: number) {
  const state = await getParticipantState(personId);
  if (!state) return;

  state.active = false;
  state.updatedAt = Date.now();

  return upsertParticipantState(state);
}

export async function activateParticipant(personId: number) {
  const state = await getParticipantState(personId);
  if (!state) return;

  state.active = true;
  state.updatedAt = Date.now();

  return upsertParticipantState(state);
}
