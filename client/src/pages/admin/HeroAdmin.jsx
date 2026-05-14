import { useEffect, useState } from 'react';
import { api, asset } from '../../services/api.js';

export default function HeroAdmin() {
  const [hero, setHero] = useState(null);
  const [form, setForm] = useState({
    heroTitle: '',
    heroSubtitle: '',
    ctaText: '',
    ctaLink: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/hero').then((r) => {
      setHero(r.data);
      setForm({
        heroTitle: r.data.heroTitle || '',
        heroSubtitle: r.data.heroSubtitle || '',
        ctaText: r.data.ctaText || '',
        ctaLink: r.data.ctaLink || '',
      });
    });
  }, []);

  const onFile = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('heroImage', file);
      const { data } = await api.put('/hero', fd);
      setHero(data);
      setStatus({ type: 'ok', msg: 'Hero actualizado' });
      setFile(null);
      setPreview(null);
    } catch (err) {
      setStatus({ type: 'err', msg: err.response?.data?.message || 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Hero principal</h1>
      <p className="text-white/60 mt-1">Imagen, título y subtítulo del inicio.</p>

      <form onSubmit={onSubmit} className="card p-6 mt-6 space-y-4 max-w-2xl">
        {status && (
          <div className={`rounded-lg px-3 py-2 text-sm ${status.type === 'ok' ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30' : 'bg-red-500/10 text-red-200 border border-red-500/30'}`}>
            {status.msg}
          </div>
        )}

        <div>
          <label className="label">Título</label>
          <input className="field" value={form.heroTitle} onChange={(e) => setForm((f) => ({ ...f, heroTitle: e.target.value }))} />
        </div>
        <div>
          <label className="label">Subtítulo</label>
          <textarea rows={3} className="field" value={form.heroSubtitle} onChange={(e) => setForm((f) => ({ ...f, heroSubtitle: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Texto del botón</label>
            <input className="field" value={form.ctaText} onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))} />
          </div>
          <div>
            <label className="label">Link del botón</label>
            <input className="field" value={form.ctaLink} onChange={(e) => setForm((f) => ({ ...f, ctaLink: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="label">Imagen de fondo</label>
          <input type="file" accept="image/*" onChange={onFile} className="block text-sm text-white/70" />
          {(preview || hero?.heroImage) && (
            <img
              src={preview || asset(hero.heroImage)}
              alt=""
              className="mt-3 rounded-xl border border-white/10 max-h-48 object-cover"
            />
          )}
        </div>
        <button className="btn-primary" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}
