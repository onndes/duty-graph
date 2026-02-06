import { db } from './index';
import { ParticipantDB } from './types';

export function addParticipant(fullName: string, note = '') {
  return db.participants.add({
    fullName,
    note,
    blockedDays: [],
    preferredDays: [],
  });
}

export function getParticipants(): Promise<ParticipantDB[]> {
  return db.participants.toArray();
}

export function removeParticipant(id: number) {
  return db.participants.delete(id);
}
