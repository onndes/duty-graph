import { db } from './index';
import type { ParticipantDB, MetaDB } from './types';

/**
 * Ключ meta-флага, что сид уже выполнен
 */
const PARTICIPANTS_SEEDED_KEY: MetaDB['key'] = 'participantsSeeded';

/**
 * Одноразовый сид участников (dev / first run).
 * Повторный запуск безопасен.
 */
export async function seedParticipants(): Promise<void> {
  const seeded = await db.meta.get(PARTICIPANTS_SEEDED_KEY);
  if (seeded) return;

  const people: Omit<ParticipantDB, 'id'>[] = [
    { fullName: 'Іваненко Іван Іванович', note: 'солдат', blockedDays: [], preferredDays: [] },
    {
      fullName: 'Петренко Петро Петрович',
      note: 'старший солдат',
      blockedDays: [],
      preferredDays: [],
    },
    {
      fullName: 'Шевченко Андрій Миколайович',
      note: 'молодший сержант',
      blockedDays: [],
      preferredDays: [],
    },
    { fullName: 'Коваль Олексій Сергійович', note: 'сержант', blockedDays: [], preferredDays: [] },
    {
      fullName: 'Бондаренко Дмитро Вікторович',
      note: 'старший сержант',
      blockedDays: [],
      preferredDays: [],
    },
    {
      fullName: 'Ткаченко Максим Олегович',
      note: 'молодший лейтенант',
      blockedDays: [],
      preferredDays: [],
    },
    { fullName: 'Кравченко Роман Ігорович', note: 'лейтенант', blockedDays: [], preferredDays: [] },
    {
      fullName: 'Мельник Артем Володимирович',
      note: 'старший лейтенант',
      blockedDays: [],
      preferredDays: [],
    },
    { fullName: 'Савченко Олег Петрович', note: 'капітан', blockedDays: [], preferredDays: [] },
    {
      fullName: 'Гриценко Владислав Андрійович',
      note: 'капітан',
      blockedDays: [],
      preferredDays: [],
    },
  ];

  await db.transaction('rw', db.participants, db.meta, async () => {
    await db.participants.bulkAdd(people);
    await db.meta.put({ key: PARTICIPANTS_SEEDED_KEY, value: true });
  });
}
