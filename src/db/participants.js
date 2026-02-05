import Dexie from 'dexie';
import { db } from './index';

// добавить
export function addParticipant(fullName, note = '') {
  return db.participants.add({
    fullName,
    note,
    // blockedDays: [], // для будущего функционала
    // preferredDays: [], // для будущего функционала
  });
}

// получить всех
export function getParticipants() {
  return db.participants.toArray();
}

// удалить
export function removeParticipant(id) {
  return db.participants.delete(id);
}

// блокировать день
// export function blockDay(participantId, date) {
//   return db.participants.update(participantId, {
//     blockedDays: Dexie.add(date),
//   });
// }
