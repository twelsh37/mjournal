/**
 * Admin is determined by matching the signed-in user's email to ADMIN_EMAIL.
 * Set ADMIN_EMAIL in .env.local (and NEXT_PUBLIC_ADMIN_EMAIL if you need client-side admin checks).
 */

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? "";

export function isAdminEmail(email: string | undefined): boolean {
  if (!email || !ADMIN_EMAIL) return false;
  return email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
}
