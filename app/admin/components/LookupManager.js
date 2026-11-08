'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const GROUPS = [
  { type: 'make', key: 'makes', label: 'Makes' },
  { type: 'model', key: 'models', label: 'Models' },
  { type: 'fuel', key: 'fuelTypes', label: 'Fuel types' },
  { type: 'body', key: 'bodyStyles', label: 'Body styles' },
  { type: 'feature', key: 'features', label: 'Features' },
];

const emptyLookups = { makes: [], models: [], fuelTypes: [], bodyStyles: [], features: [] };

export default function LookupManager() {
  const [lookups, setLookups] = useState(emptyLookups);
  const [makeId, setMakeId] = useState('');
  const [names, setNames] = useState({});
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadLookups() {
    setError('');
    try {
      const response = await fetch('/api/admin/lookups', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load lookup values.');
      setLookups({ ...emptyLookups, ...data });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLookups(); }, []);

  async function send(method, payload) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/lookups', {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to update lookups.');
      await loadLookups();
      return data;
    } catch (saveError) {
      setError(saveError.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function add(type) {
    const name = names[type]?.trim();
    if (!name || (type === 'model' && !makeId)) return;
    const data = await send('POST', { type, name, ...(type === 'model' ? { makeId } : {}) });
    if (data) {
      setNames({ ...names, [type]: '' });
      setNotice('Lookup added.');
    }
  }

  async function saveEdit(group, item) {
    const data = await send('PATCH', {
      type: group.type,
      id: item.id,
      name: editName.trim(),
      ...(group.type === 'model' ? { makeId: item.makeId } : {}),
    });
    if (data) {
      setEditing(null);
      setNotice('Lookup updated.');
    }
  }

  async function remove(group, item) {
    if (!window.confirm(`Delete ${item.name}? Vehicles using this value may prevent deletion.`)) return;
    const data = await send('DELETE', { type: group.type, id: item.id });
    if (data) setNotice('Lookup deleted.');
  }

  if (loading) return <p className="py-10 text-sm text-zinc-600">Loading lookups…</p>;

  return (
    <section>
      <div className="mb-5 border-b border-zinc-300 pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">Configuration</p>
        <h1 className="mt-1 text-2xl font-black">Lookups</h1>
      </div>
      {error && <p className="mb-4 border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{error}</p>}
      {notice && <p className="mb-4 text-sm text-emerald-800" aria-live="polite">{notice}</p>}
      <div className="divide-y divide-zinc-300 border-y border-zinc-300">
        {GROUPS.map((group) => (
          <section key={group.type} className="grid gap-5 py-5 md:grid-cols-[minmax(12rem,0.7fr)_minmax(20rem,1.3fr)]">
            <div>
              <h2 className="text-base font-bold">{group.label}</h2>
              <p className="mt-1 text-sm text-zinc-600">{lookups[group.key].length} values</p>
            </div>
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                {group.type === 'model' && (
                  <select aria-label="Make for model" className="min-h-10 border border-zinc-300 bg-white px-3 text-sm" value={makeId} onChange={(event) => setMakeId(event.target.value)}>
                    <option value="">Select make</option>
                    {lookups.makes.map((make) => <option key={make.id} value={make.id}>{make.name}</option>)}
                  </select>
                )}
                <input
                  aria-label={`New ${group.label.toLowerCase()}`}
                  className="min-h-10 min-w-48 flex-1 border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-red-700"
                  onChange={(event) => setNames({ ...names, [group.type]: event.target.value })}
                  onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add(group.type); } }}
                  placeholder={`Add ${group.label.toLowerCase()}`}
                  value={names[group.type] ?? ''}
                />
                <button aria-label={`Add ${group.type}`} className="inline-flex size-10 items-center justify-center bg-zinc-950 text-white hover:bg-zinc-800 disabled:opacity-50" disabled={busy || !names[group.type]?.trim() || (group.type === 'model' && !makeId)} onClick={() => add(group.type)} title="Add" type="button">
                  <FiPlus aria-hidden="true" />
                </button>
              </div>
              <ul className="divide-y divide-zinc-200 border border-zinc-200 bg-white">
                {lookups[group.key].filter((item) => group.type !== 'model' || !makeId || item.makeId === makeId).map((item) => (
                  <li key={item.id} className="flex min-h-11 items-center gap-2 px-3 py-1.5">
                    {editing === item.id ? (
                      <>
                        <input aria-label={`Rename ${item.name}`} className="min-h-9 min-w-0 flex-1 border border-zinc-300 px-2 text-sm" value={editName} onChange={(event) => setEditName(event.target.value)} />
                        <button className="text-sm font-bold text-red-700 hover:underline" disabled={busy} onClick={() => saveEdit(group, item)} type="button">Save</button>
                        <button className="text-sm text-zinc-600 hover:underline" onClick={() => setEditing(null)} type="button">Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
                        {group.type === 'model' && <span className="text-xs text-zinc-500">{lookups.makes.find((make) => make.id === item.makeId)?.name}</span>}
                        <button className="px-2 py-1 text-sm font-semibold text-red-700 hover:underline" onClick={() => { setEditing(item.id); setEditName(item.name); }} type="button">Rename</button>
                        <button aria-label={`Delete ${item.name}`} className="inline-flex size-8 items-center justify-center text-zinc-500 hover:bg-red-50 hover:text-red-700" onClick={() => remove(group, item)} title="Delete" type="button"><FiTrash2 aria-hidden="true" /></button>
                      </>
                    )}
                  </li>
                ))}
                {lookups[group.key].length === 0 && <li className="px-3 py-3 text-sm text-zinc-500">No values yet.</li>}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}