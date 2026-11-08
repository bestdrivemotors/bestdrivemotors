'use client';

import Image from 'next/image';
import { startTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiUpload } from 'react-icons/fi';
import { compressImageFile } from '@/lib/images/browser-compress';

const EMPTY_VALUES = {
  stockNumber: '', year: '', makeId: '', modelId: '', fuelId: '', bodyId: '', variant: '',
  priceNzd: '', odometerKm: '', transmission: 'automatic', drivetrain: 'fwd', colour: '',
  seats: 5, doors: 4, origin: 'nz_new', wofExpiry: '', regoExpiry: '', description: '',
  status: 'draft', featured: false, featureIds: [],
};
const DRAFT_KEY = 'vehicle_form_draft';

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Unable to save vehicle.');
  return data;
}

export default function VehicleForm({ vehicleId }) {
  const router = useRouter();
  const [savedVehicleId, setSavedVehicleId] = useState(vehicleId);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [lookups, setLookups] = useState({ makes: [], models: [], fuelTypes: [], bodyStyles: [], features: [] });
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(Boolean(vehicleId));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [lookupResponse, vehicleResponse] = await Promise.all([
          fetch('/api/admin/lookups', { cache: 'no-store' }),
          vehicleId ? fetch(`/api/admin/vehicles/${vehicleId}`, { cache: 'no-store' }) : Promise.resolve(null),
        ]);
        const lookupData = await readJson(lookupResponse);
        const vehicleData = vehicleResponse ? await readJson(vehicleResponse) : null;
        if (!active) return;
        setLookups(lookupData);
        if (vehicleData) {
          const record = vehicleData.vehicle;
          setImages(vehicleData.images ?? []);
          startTransition(() => setValues({
            ...EMPTY_VALUES,
            ...record,
            year: String(record.year ?? ''),
            priceNzd: String(record.priceNzd ?? ''),
            odometerKm: String(record.odometerKm ?? ''),
            wofExpiry: record.wofExpiry ?? '',
            regoExpiry: record.regoExpiry ?? '',
            featureIds: record.featureIds ?? [],
          }));
        } else {
          try {
            const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
            if (draft && !draft.vehicleId) startTransition(() => setValues({ ...EMPTY_VALUES, ...draft.values }));
          } catch {
            localStorage.removeItem(DRAFT_KEY);
          }
        }
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [vehicleId]);

  function changeField(name, value) {
    const next = { ...values, [name]: value };
    setValues(next);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ vehicleId: savedVehicleId ?? null, values: next }));
    } catch {
      setNotice('Draft could not be saved in this browser.');
    }
  }

  function toggleFeature(featureId) {
    const selected = values.featureIds.includes(featureId)
      ? values.featureIds.filter((id) => id !== featureId)
      : [...values.featureIds, featureId];
    changeField('featureIds', selected);
  }

  async function uploadFiles(id) {
    for (const [index, originalFile] of selectedFiles.entries()) {
      const file = await compressImageFile(originalFile);
      const formData = new FormData();
      formData.set('file', file);
      formData.set('isCover', String(images.length === 0 && index === 0));
      formData.set('sortOrder', String(images.length + index));
      const response = await fetch(`/api/admin/vehicles/${id}/images`, { method: 'POST', body: formData });
      await readJson(response);
    }
  }

  async function makeCover(image) {
    setError('');
    try {
      const response = await fetch(`/api/admin/vehicles/${savedVehicleId}/images/${image.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isCover: true }),
      });
      await readJson(response);
      setImages(images.map((item) => ({ ...item, isCover: item.id === image.id })));
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  async function removeImage(image) {
    if (!window.confirm('Remove this photo from the vehicle?')) return;
    setError('');
    try {
      const response = await fetch(`/api/admin/vehicles/${savedVehicleId}/images/${image.id}`, { method: 'DELETE' });
      await readJson(response);
      setImages(images.filter((item) => item.id !== image.id));
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  async function removeVehicle() {
    if (!window.confirm('Delete this vehicle and its photos? This cannot be undone.')) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/vehicles/${savedVehicleId}`, { method: 'DELETE' });
      await readJson(response);
      localStorage.removeItem(DRAFT_KEY);
      router.replace('/admin/vehicles');
      router.refresh();
    } catch (actionError) {
      setError(actionError.message);
      setBusy(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const payload = {
        ...values,
        year: Number(values.year),
        priceNzd: Number(values.priceNzd),
        odometerKm: Number(values.odometerKm),
        seats: Number(values.seats),
        doors: Number(values.doors),
      };
      const response = await fetch(savedVehicleId ? `/api/admin/vehicles/${savedVehicleId}` : '/api/admin/vehicles', {
        method: savedVehicleId ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await readJson(response);
      const savedId = data.vehicle.id;
      setSavedVehicleId(savedId);
      if (selectedFiles.length) {
        setNotice(`Vehicle saved. Uploading ${selectedFiles.length} photo${selectedFiles.length === 1 ? '' : 's'}…`);
        await uploadFiles(savedId);
      }
      localStorage.removeItem(DRAFT_KEY);
      router.replace(`/admin/vehicles/${savedId}/edit`);
      router.refresh();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  const inputClass = 'mt-1 block min-h-10 w-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700';
  const fieldClass = 'block text-sm font-semibold text-zinc-800';
  const models = lookups.models.filter((model) => !values.makeId || model.makeId === values.makeId);

  if (loading) return <p className="py-10 text-sm text-zinc-600">Loading vehicle…</p>;

  return (
    <form className="space-y-7" onSubmit={submit}>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-300 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">Inventory record</p>
          <h1 className="mt-1 text-2xl font-black">{vehicleId ? 'Edit vehicle' : 'Add vehicle'}</h1>
        </div>
        <div className="flex gap-2">
          {savedVehicleId && <button className="min-h-10 border border-red-300 bg-white px-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-60" disabled={busy} onClick={removeVehicle} type="button">Delete vehicle</button>}
          <button className="inline-flex min-h-10 items-center gap-2 bg-red-700 px-4 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-60" disabled={busy} type="submit">
            <FiSave aria-hidden="true" /> {busy ? 'Saving…' : 'Save vehicle'}
          </button>
        </div>
      </div>

      {error && <p className="border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{error}</p>}
      {notice && <p className="text-sm text-emerald-800" aria-live="polite">{notice}</p>}

      <section>
        <h2 className="mb-3 text-base font-bold">Vehicle details</h2>
        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className={fieldClass}>Stock number<input className={inputClass} value={values.stockNumber} onChange={(event) => changeField('stockNumber', event.target.value)} required /></label>
          <label className={fieldClass}>Year<input className={inputClass} type="number" min="1900" max={new Date().getFullYear() + 1} value={values.year} onChange={(event) => changeField('year', event.target.value)} required /></label>
          <label className={fieldClass}>Make<select className={inputClass} value={values.makeId} onChange={(event) => {
            const next = { ...values, makeId: event.target.value, modelId: '' };
            setValues(next);
            try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ vehicleId: savedVehicleId ?? null, values: next })); } catch { setNotice('Draft could not be saved in this browser.'); }
          }} required><option value="">Select make</option>{lookups.makes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className={fieldClass}>Model<select className={inputClass} value={values.modelId} onChange={(event) => changeField('modelId', event.target.value)} required><option value="">Select model</option>{models.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className={fieldClass}>Variant<input className={inputClass} value={values.variant} onChange={(event) => changeField('variant', event.target.value)} /></label>
          <label className={fieldClass}>Fuel<select className={inputClass} value={values.fuelId} onChange={(event) => changeField('fuelId', event.target.value)} required><option value="">Select fuel</option>{lookups.fuelTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className={fieldClass}>Body style<select className={inputClass} value={values.bodyId} onChange={(event) => changeField('bodyId', event.target.value)} required><option value="">Select body style</option>{lookups.bodyStyles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className={fieldClass}>Price (NZD)<input className={inputClass} type="number" min="0" step="1" value={values.priceNzd} onChange={(event) => changeField('priceNzd', event.target.value)} required /></label>
          <label className={fieldClass}>Odometer (km)<input className={inputClass} type="number" min="0" step="1" value={values.odometerKm} onChange={(event) => changeField('odometerKm', event.target.value)} required /></label>
          <label className={fieldClass}>Transmission<select className={inputClass} value={values.transmission} onChange={(event) => changeField('transmission', event.target.value)}><option value="automatic">Automatic</option><option value="manual">Manual</option><option value="cvt">CVT</option></select></label>
          <label className={fieldClass}>Drivetrain<select className={inputClass} value={values.drivetrain} onChange={(event) => changeField('drivetrain', event.target.value)}><option value="fwd">FWD</option><option value="rwd">RWD</option><option value="awd">AWD</option><option value="4wd">4WD</option></select></label>
          <label className={fieldClass}>Colour<input className={inputClass} value={values.colour} onChange={(event) => changeField('colour', event.target.value)} required /></label>
          <label className={fieldClass}>Seats<input className={inputClass} type="number" min="1" max="12" value={values.seats} onChange={(event) => changeField('seats', event.target.value)} required /></label>
          <label className={fieldClass}>Doors<input className={inputClass} type="number" min="2" max="6" value={values.doors} onChange={(event) => changeField('doors', event.target.value)} required /></label>
          <label className={fieldClass}>Origin<select className={inputClass} value={values.origin} onChange={(event) => changeField('origin', event.target.value)}><option value="nz_new">NZ new</option><option value="import">Import</option></select></label>
          <label className={fieldClass}>WOF expiry<input className={inputClass} type="date" value={values.wofExpiry} onChange={(event) => changeField('wofExpiry', event.target.value)} /></label>
          <label className={fieldClass}>Registration expiry<input className={inputClass} type="date" value={values.regoExpiry} onChange={(event) => changeField('regoExpiry', event.target.value)} /></label>
          <label className={fieldClass}>Status<select className={inputClass} value={values.status} onChange={(event) => changeField('status', event.target.value)}><option value="draft">Draft</option><option value="available">Available</option><option value="sold">Sold</option></select></label>
          <label className="flex min-h-10 items-center gap-3 self-end border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold"><input checked={values.featured} onChange={(event) => changeField('featured', event.target.checked)} type="checkbox" /> Featured on home</label>
        </div>
      </section>

      <section className="border-t border-zinc-300 pt-5">
        <label className={`${fieldClass} max-w-3xl`}>Description<textarea className={`${inputClass} min-h-32 resize-y`} maxLength={4000} value={values.description} onChange={(event) => changeField('description', event.target.value)} /></label>
      </section>

      <section className="border-t border-zinc-300 pt-5">
        <h2 className="mb-3 text-base font-bold">Features</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {lookups.features.map((feature) => (
            <label key={feature.id} className="flex items-center gap-2 border border-zinc-300 bg-white px-3 py-2 text-sm">
              <input checked={values.featureIds.includes(feature.id)} onChange={() => toggleFeature(feature.id)} type="checkbox" />
              {feature.name}
            </label>
          ))}
          {lookups.features.length === 0 && <p className="text-sm text-zinc-600">Add reusable features under Lookups.</p>}
        </div>
      </section>

      <section className="border-t border-zinc-300 pt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold">Gallery</h2>
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 border border-zinc-300 bg-white px-3 text-sm font-semibold hover:bg-zinc-50">
            <FiUpload aria-hidden="true" /> Select photos
            <input accept="image/*" className="sr-only" multiple onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))} type="file" />
          </label>
        </div>
        {selectedFiles.length > 0 && <p className="mb-3 text-sm text-zinc-600">{selectedFiles.length} selected. Photos are compressed before upload.</p>}
        <div className="flex flex-wrap gap-3">
          {images.map((image) => (
            <div key={image.id} className="w-36 border border-zinc-300 bg-white p-1">
              <Image alt="Vehicle gallery image" className="h-24 w-full object-cover" height={96} src={image.thumbUrl || image.publicUrl} unoptimized width={144} />
              <div className="flex min-h-8 items-center justify-between gap-1 px-1">
                {image.isCover ? <span className="text-[10px] font-bold uppercase text-red-700">Cover</span> : <button className="text-[10px] font-semibold text-zinc-700 hover:text-red-700" onClick={() => makeCover(image)} type="button">Make cover</button>}
                <button aria-label="Remove photo" className="text-[10px] font-semibold text-zinc-500 hover:text-red-700" onClick={() => removeImage(image)} type="button">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end border-t border-zinc-300 pt-5">
        <button className="inline-flex min-h-11 items-center gap-2 bg-red-700 px-5 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-60" disabled={busy} type="submit">
          <FiSave aria-hidden="true" /> {busy ? 'Saving…' : 'Save vehicle'}
        </button>
      </div>
    </form>
  );
}