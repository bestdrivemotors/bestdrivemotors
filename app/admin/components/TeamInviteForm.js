'use client';

import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

export default function TeamInviteForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to send invitation.');
      setEmail('');
      setNotice(`Password setup code sent to ${data.email}.`);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-2xl">
      <div className="mb-5 border-b border-zinc-300 pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">Access</p>
        <h1 className="mt-1 text-2xl font-black">Team</h1>
      </div>
      <p className="mb-5 max-w-xl text-sm leading-6 text-zinc-600">Invite a staff member by email. They will receive a one-time code to set their password.</p>
      {error && <p className="mb-4 border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{error}</p>}
      {notice && <p className="mb-4 text-sm text-emerald-800" aria-live="polite">{notice}</p>}
      <form className="flex flex-wrap items-end gap-3 border-y border-zinc-300 py-5" onSubmit={submit}>
        <label className="min-w-56 flex-1 text-sm font-semibold">Staff email<input className="mt-1 block min-h-11 w-full border border-zinc-300 bg-white px-3 text-sm font-normal outline-none focus:border-red-700" autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
        <button className="inline-flex min-h-11 items-center gap-2 bg-red-700 px-4 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-60" disabled={busy} type="submit"><FiSend aria-hidden="true" />{busy ? 'Sending…' : 'Invite staff'}</button>
      </form>
    </section>
  );
}