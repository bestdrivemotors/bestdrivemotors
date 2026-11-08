import { describe, expect, it } from 'vitest';
import { canSendAdminOtp, parseInitialAdminEmails } from '@/lib/auth/allowlist';

describe('parseInitialAdminEmails', () => {
  it('splits a comma-separated env value and lowercases emails', () => {
    expect(parseInitialAdminEmails('A@Yard.nz, b@yard.nz')).toEqual(['a@yard.nz', 'b@yard.nz']);
  });
});

describe('canSendAdminOtp', () => {
  it('allows bootstrap emails and already-invited users only', () => {
    const initialEmails = ['owner@yard.nz'];
    const existingUserEmails = ['staff@yard.nz'];
    expect(canSendAdminOtp('owner@yard.nz', { initialEmails, existingUserEmails })).toBe(true);
    expect(canSendAdminOtp('STAFF@yard.nz', { initialEmails, existingUserEmails })).toBe(true);
    expect(canSendAdminOtp('stranger@example.com', { initialEmails, existingUserEmails })).toBe(false);
  });
});
