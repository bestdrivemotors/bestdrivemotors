export function parseInitialAdminEmails(value) {
  return String(value ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function canSendAdminOtp(email, { initialEmails = [], existingUserEmails = [] }) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  if (!normalizedEmail) return false;

  return [...initialEmails, ...existingUserEmails].some(
    (allowedEmail) => String(allowedEmail).trim().toLowerCase() === normalizedEmail,
  );
}