// Admin whitelist - LINE user IDs that have admin access
// Used by both the /admin page (client-side UI gating) and the
// admin API routes (server-side authorization).
export const ADMIN_LINE_USER_IDS: readonly string[] = [
  'Uf76e3eb14e24d943fbb9ab587f36e1ae', // Akira
];

export function isAdmin(lineUserId: string | null | undefined): boolean {
  if (!lineUserId) return false;
  return ADMIN_LINE_USER_IDS.includes(lineUserId);
}
