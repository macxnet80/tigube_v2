/**
 * „NEW“-Badge neben dem Jobs-Link im Header.
 * Start = erster Anzeigezeitpunkt (UTC); sichtbar für genau 7×24 Stunden danach.
 * Beim Go-live `JOBS_LINK_NEW_BADGE_START_MS` auf den gewünschten Tag setzen.
 */
export const JOBS_LINK_NEW_BADGE_START_MS = Date.UTC(2026, 2, 22, 0, 0, 0, 0);

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function isJobsLinkNewBadgeActive(nowMs: number = Date.now()): boolean {
  return nowMs >= JOBS_LINK_NEW_BADGE_START_MS && nowMs < JOBS_LINK_NEW_BADGE_START_MS + SEVEN_DAYS_MS;
}
