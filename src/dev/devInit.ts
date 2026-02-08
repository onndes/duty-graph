/**
 * Development-only initialization.
 *
 * This file is responsible for:
 * - seeding demo data (participants)
 * - creating default meta configuration
 *
 * IMPORTANT:
 * - Must NOT contain business logic
 * - Must be safe to run multiple times
 * - Should be imported ONLY from app/bootstrap layer
 */

import { seedParticipants } from '../db/devSeed';
import { getMeta, setMeta } from '../db/meta';
import { seedParticipantStates } from '../db/seedParticipantStates';

/**
 * Initializes development defaults.
 * This function is idempotent and can be safely called
 * on every application start during development.
 */
export async function devInit(): Promise<void> {
  // 1. Seed demo participants (guarded internally)
  await seedParticipants();
  await seedParticipantStates();

  // 2. Ensure default meta configuration exists
  const resetAfterDays = await getMeta<number>('resetAfterDays');
  if (!resetAfterDays) {
    await setMeta<number>('resetAfterDays', 30);
  }
}
