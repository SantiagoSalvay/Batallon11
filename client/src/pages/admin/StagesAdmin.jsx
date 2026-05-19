import { useEffect, useState } from 'react';
import { api, asset } from '../../services/api.js';

export default function StagesAdmin() {
  const [stages, setStages] = useState([]);
  const [editingSlug, setEditingSlug] = useState(null);
  const [logo, setLogo] = useState(null);
  const [cover, setCover] = useState(null);
  const [status, setStatus] = useState(null);

  const load = () => api.get('/stages').then((r) => setStages(r.data));

  useEffect(() => {
    load();
  }, []);

  const startEdit = (slug) => {
    setEditingSlug(slug);
    setLogo(null);
    setCover(null);
    setStatus(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!editingSlug) return;
    if (!logo && !cover) {
      setStatus({ type: 'err', msg: 'Seleccioná al menos logo o portada' });
      return;
    }
    setStatus(null);
    try {
      const fd = new FormData();
      if (logo) fd.append('logo', logo);
      if (cover) fd.append('coverImage', cover);
      await api.put(`/stages/${editingSlug}/media`, fd);
      await load();
      setEditingSlug(null);
      setLogo(null);
      setCover(null);
      setStatus({ type: 'ok', msg: 'Imágenes actualizadas' });
    } catch (err) {
      setStatus({ type: 'err', msg: err.response?.data?.message || 'Error al guardar' });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Medios de etapas</h1>
      <p className="text-white/60 mt-1">
        Los nombres y lemas están definidos en código. Acá solo podés subir logo y portada (se guardan como URL).
      </p>

      {status && (
        
        <div
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            status.type === 'ok'
              ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30'
              : 'bg-red-500/10 text-red-200 border border-red-500/30'
          }`}
        >
          {status.msg}
        </div>
      )}

      {editingSlug && (
        <form onSubmit={submit} className="card p-6 mt-6 space-y-4 max-w-xl">
          <h2 className="font-bold">
            Subir imágenes — {stages.find((s) => s.slug === editingSlug)?.name}
          </h2>
          <div>
            <label className="label">Logo (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files?.[0] || null)}
              className="block text-sm text-white/70"
            />
          </div>
          <div>
            <label className="label">Portada (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCover(e.target.files?.[0] || null)}
              className="block text-sm text-white/70"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingSlug(null);
                setLogo(null);
                setCover(null);
              }}
              className="btn-ghost"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-3">
        {stages.map((stage) => (
          <div key={stage.slug} className="card p-4 flex items-center gap-4">
            <div
              className="h-12 w-12 rounded-xl flex-shrink-0 grid place-items-center"
              style={{ backgroundColor: `${stage.color}30` }}
            >
              {stage.logo ? (
                <img src={asset(stage.logo)} alt="" className="h-10 w-10 object-contain" />
              ) : (
                <span className="text-xs text-white/40">—</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold">{stage.name}</div>
              <div className="text-xs text-white/50 italic">{stage.motto}</div>
              <div className="text-xs text-white/40">/etapas/{stage.slug}</div>
            
            </div>
            <button type="button" onClick={() => startEdit(stage.slug)} className="btn-ghost text-sm">
              {stage.logo || stage.coverImage ? 'Cambiar imágenes' : 'Subir imágenes'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
