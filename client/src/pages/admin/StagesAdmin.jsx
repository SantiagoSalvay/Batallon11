import { useEffect, useState } from 'react';
import { api, asset } from '../../services/api.js';

const EMPTY = {
  id: null,
  name: '',
  slug: '',
  description: '',
  color: '#3458ff',
  order: 0,
  logo: null,
  coverImage: null,
};

export default function StagesAdmin() {
  const [stages, setStages] = useState([]);
  const [editing, setEditing] = useState(EMPTY);
  const [logo, setLogo] = useState(null);
  const [cover, setCover] = useState(null);
  const [status, setStatus] = useState(null);

  const load = () => api.get('/stages').then((r) => setStages(r.data));

  useEffect(() => {
    load();
  }, []);

  const startEdit = (s) => {
    setEditing({ ...s });
    setLogo(null);
    setCover(null);
  };

  const reset = () => {
    setEditing(EMPTY);
    setLogo(null);
    setCover(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const fd = new FormData();
      ['name', 'slug', 'description', 'color'].forEach((k) => {
        if (editing[k] !== undefined && editing[k] !== null) fd.append(k, editing[k] ?? '');
      });
      fd.append('order', String(editing.order ?? 0));
      if (logo) fd.append('logo', logo);
      if (cover) fd.append('coverImage', cover);

      if (editing.id) {
        await api.put(`/stages/${editing.id}`, fd);
      } else {
        await api.post('/stages', fd);
      }
      await load();
      reset();
      setStatus({ type: 'ok', msg: 'Etapa guardada' });
    } catch (err) {
      setStatus({ type: 'err', msg: err.response?.data?.message || 'Error al guardar' });
    }
  };

  const remove = async (s) => {
    if (!confirm(`Eliminar la etapa "${s.name}"? Esto borra sus publicaciones y galería.`)) return;
    await api.delete(`/stages/${s.id}`);
    await load();
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Etapas</h1>
      <p className="text-white/60 mt-1">Gestioná las etapas del batallón.</p>

      {status && (
        <div className={`mt-4 rounded-lg px-3 py-2 text-sm ${status.type === 'ok' ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30' : 'bg-red-500/10 text-red-200 border border-red-500/30'}`}>
          {status.msg}
        </div>
      )}

      <form onSubmit={submit} className="card p-6 mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{editing.id ? 'Editar etapa' : 'Nueva etapa'}</h2>
          {editing.id && (
            <button type="button" onClick={reset} className="text-sm text-white/60 hover:text-white">
              Cancelar edición
            </button>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre</label>
            <input className="field" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Slug (URL)</label>
            <input className="field" value={editing.slug} placeholder="auto desde nombre" onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Descripción</label>
            <textarea rows={3} className="field" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Color</label>
            <input type="color" className="h-11 w-full rounded-xl bg-ink-800 border border-white/10" value={editing.color || '#3458ff'} onChange={(e) => setEditing({ ...editing, color: e.target.value })} />
          </div>
          <div>
            <label className="label">Orden</label>
            <input type="number" className="field" value={editing.order ?? 0} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Logo</label>
            <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} className="block text-sm text-white/70" />
            {editing.logo && <img src={asset(editing.logo)} alt="" className="mt-2 h-16 rounded-lg" />}
          </div>
          <div>
            <label className="label">Portada</label>
            <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] || null)} className="block text-sm text-white/70" />
            {editing.coverImage && <img src={asset(editing.coverImage)} alt="" className="mt-2 h-16 rounded-lg object-cover" />}
          </div>
        </div>
        <button className="btn-primary">{editing.id ? 'Actualizar' : 'Crear etapa'}</button>
      </form>

      <div className="mt-8 space-y-3">
        {stages.map((s) => (
          <div key={s.id} className="card p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex-shrink-0 grid place-items-center" style={{ backgroundColor: `${s.color || '#3458ff'}30` }}>
              {s.logo ? <img src={asset(s.logo)} alt="" className="h-10 w-10 object-contain" /> : <span className="text-xs">·</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold">{s.name}</div>
              <div className="text-xs text-white/50">/etapas/{s.slug}</div>
            </div>
            <button onClick={() => startEdit(s)} className="btn-ghost text-sm">Editar</button>
            <button onClick={() => remove(s)} className="text-sm text-red-300 hover:text-red-200 px-3 py-2">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
