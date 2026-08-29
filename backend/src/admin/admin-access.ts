/** Comma-separated emails in ADMIN_EMAILS. Empty list means nobody is an admin. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

export function isAdminUser(user?: { email?: string | null; isAdmin?: boolean } | null): boolean {
  if (!user) return false;
  return Boolean(user.isAdmin) || isAdminEmail(user.email);
}
