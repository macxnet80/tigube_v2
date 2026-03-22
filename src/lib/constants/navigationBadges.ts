/**
 * „NEW“-Badges im Header (Jobs, Marktplatz).
 * Start = erster Anzeigezeitpunkt (UTC); sichtbar für genau 7×24 Stunden danach.
 * Beim Go-live die `*_START_MS`-Konstanten auf den gewünschten Tag setzen.
 */
export const JOBS_LINK_NEW_BADGE_START_MS = Date.UTC(2026, 2, 22, 0, 0, 0, 0);

/** Marktplatz-Zubehör — eigenes Startdatum möglich (z. B. späterer Launch als Jobs). */
export const MARKTPLATZ_LINK_NEW_BADGE_START_MS = Date.UTC(2026, 2, 22, 0, 0, 0, 0);

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function isJobsLinkNewBadgeActive(nowMs: number = Date.now()): boolean {
  return nowMs >= JOBS_LINK_NEW_BADGE_START_MS && nowMs < JOBS_LINK_NEW_BADGE_START_MS + SEVEN_DAYS_MS;
}

export function isMarktplatzLinkNewBadgeActive(nowMs: number = Date.now()): boolean {
  return (
    nowMs >= MARKTPLATZ_LINK_NEW_BADGE_START_MS &&
    nowMs < MARKTPLATZ_LINK_NEW_BADGE_START_MS + SEVEN_DAYS_MS
  );
}
