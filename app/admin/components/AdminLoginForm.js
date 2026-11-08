'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

async function postAuth(path, body) {
  const response = await fetch(`/api/auth/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error?.message || 'Unable to complete sign-in.');
  return data;
}

export default function AdminLoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(action) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function signInWithPassword(event) {
    event.preventDefault();
    return submit(async () => {
      await postAuth('sign-in/email', { email: email.trim().toLowerCase(), password });
      router.replace('/admin/vehicles');
      router.refresh();
    });
  }

  function requestCode(event) {
    event.preventDefault();
    return submit(async () => {
      await postAuth('email-otp/send-verification-otp', {
        email: email.trim().toLowerCase(),
        type: 'sign-in',
      });
      setMode('verify-code');
      setMessage('If that email can access the admin, a code has been sent.');
    });
  }

  function verifyCode(event) {
    event.preventDefault();
    return submit(async () => {
      await postAuth('sign-in/email-otp', { email: email.trim().toLowerCase(), otp });
      router.replace('/admin/vehicles');
      router.refresh();
    });
  }

  function requestPasswordCode(event) {
    event.preventDefault();
    return submit(async () => {
      await postAuth('email-otp/request-password-reset', { email: email.trim().toLowerCase() });
      setMode('set-password');
      setMessage('If that email can access the admin, a password setup code has been sent.');
    });
  }

  function submitPasswordReset(event) {
    event.preventDefault();
    return submit(async () => {
      await postAuth('email-otp/reset-password', {
        email: email.trim().toLowerCase(),
        otp,
        password: newPassword,
      });
      await postAuth('sign-in/email', { email: email.trim().toLowerCase(), password: newPassword });
      router.replace('/admin/vehicles');
      router.refresh();
    });
  }

  const inputClass = 'mt-1 block w-full border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700';
  const buttonClass = 'inline-flex min-h-11 w-full items-center justify-center gap-2 bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <div className="w-full max-w-md border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7 border-b border-zinc-200 pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">Best Drive Motors</p>
        <h1 className="mt-2 text-2xl font-black text-zinc-950">Admin sign in</h1>
      </div>

      {mode === 'password' && (
        <form className="space-y-4" onSubmit={signInWithPassword}>
          <label className="block text-sm font-semibold text-zinc-800">
            Email
            <input className={inputClass} autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="block text-sm font-semibold text-zinc-800">
            Password
            <input className={inputClass} autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className={buttonClass} disabled={busy} type="submit">{busy ? 'Signing in…' : 'Sign in'}</button>
          <div className="flex justify-between gap-4 text-sm">
            <button className="font-semibold text-red-700 hover:underline" onClick={() => setMode('request-code')} type="button">Email me a code</button>
            <button className="font-semibold text-zinc-600 hover:underline" onClick={() => setMode('request-password')} type="button">Set or reset password</button>
          </div>
        </form>
      )}

      {mode === 'request-code' && (
        <form className="space-y-4" onSubmit={requestCode}>
          <label className="block text-sm font-semibold text-zinc-800">Email<input className={inputClass} autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <button className={buttonClass} disabled={busy} type="submit">{busy ? 'Sending…' : 'Send sign-in code'}</button>
          <button className="text-sm font-semibold text-zinc-600 hover:underline" onClick={() => setMode('password')} type="button">Back to password sign in</button>
        </form>
      )}

      {mode === 'verify-code' && (
        <form className="space-y-4" onSubmit={verifyCode}>
          <p className="text-sm text-zinc-600">Enter the code sent to your email address.</p>
          <label className="block text-sm font-semibold text-zinc-800">Email<input className={inputClass} autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label className="block text-sm font-semibold text-zinc-800">Verification code<input className={inputClass} autoComplete="one-time-code" inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value)} required /></label>
          <button className={buttonClass} disabled={busy} type="submit">{busy ? 'Checking…' : 'Verify and sign in'}</button>
          <button className="text-sm font-semibold text-zinc-600 hover:underline" onClick={() => setMode('request-code')} type="button">Send another code</button>
        </form>
      )}

      {mode === 'request-password' && (
        <form className="space-y-4" onSubmit={requestPasswordCode}>
          <label className="block text-sm font-semibold text-zinc-800">Email<input className={inputClass} autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <button className={buttonClass} disabled={busy} type="submit">{busy ? 'Sending…' : 'Send password code'}</button>
          <button className="text-sm font-semibold text-zinc-600 hover:underline" onClick={() => setMode('password')} type="button">Back to sign in</button>
        </form>
      )}

      {mode === 'set-password' && (
        <form className="space-y-4" onSubmit={submitPasswordReset}>
          <label className="block text-sm font-semibold text-zinc-800">Email<input className={inputClass} autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label className="block text-sm font-semibold text-zinc-800">Verification code<input className={inputClass} autoComplete="one-time-code" inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value)} required /></label>
          <label className="block text-sm font-semibold text-zinc-800">New password<input className={inputClass} autoComplete="new-password" type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
          <button className={buttonClass} disabled={busy} type="submit">{busy ? 'Saving…' : 'Set password'}</button>
          <button className="text-sm font-semibold text-zinc-600 hover:underline" onClick={() => setMode('password')} type="button">Back to sign in</button>
        </form>
      )}

      {message && <p className="mt-4 text-sm text-emerald-800" aria-live="polite">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
    </div>
  );
}