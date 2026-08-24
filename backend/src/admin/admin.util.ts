/** Comma-separated admin emails from ADMIN_EMAILS env var, plus ADMIN_EMAIL if set. */
export function parseAdminEmails(): string[] {
  const emails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const bootstrapEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (bootstrapEmail && !emails.includes(bootstrapEmail)) {
    emails.push(bootstrapEmail);
  }

  return emails;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return parseAdminEmails().includes(email.toLowerCase());
}
