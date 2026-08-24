import { useEffect, useState } from 'react';
import { api, asset } from '../../services/api.js';
import AdminFileInput from '../../components/admin/AdminFileInput.jsx';
import AdminDateTimeField from '../../components/admin/AdminDateTimeField.jsx';

const EMPTY = { id: null, title: '', description: '', date: '', location: '' };

function toDatetimeLocal(d) {
  if (!d) return '';
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EventsAdmin() {
  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState(null);

  const load = () => api.get('/events').then((r) => setEvents(r.data));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      if (!editing.date) {
        setStatus({ type: 'err', msg: 'Selecciona una fecha y hora' });
        return;
      }
      const fd = new FormData();
      fd.append('title', editing.title);
      fd.append('description', editing.description);
      fd.append('date', new Date(editing.date).toISOString());
      fd.append('location', editing.location || '');
      if (image) fd.append('image', image);

      if (editing.id) await api.put(`/events/${editing.id}`, fd);
      else await api.post('/events', fd);

      setEditing(EMPTY);
      setImage(null);
      await load();
      setStatus({ type: 'ok', msg: 'Evento guardado' });
    } catch (err) {
      setStatus({ type: 'err', msg: err.response?.data?.message || 'Error al guardar' });
    }
  };

  const remove = async (ev) => {
    if (!confirm(`¿Eliminar "${ev.title}"?`)) return;
    await api.delete(`/events/${ev.id}`);
    await load();
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Eventos</h1>

      {status && (
        <div className={`mt-4 rounded-lg px-3 py-2 text-sm ${status.type === 'ok' ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30' : 'bg-red-500/10 text-red-200 border border-red-500/30'}`}>
          {status.msg}
        </div>
      )}

      <form onSubmit={submit} className="card relative z-20 overflow-visible p-6 mt-6 space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{editing.id ? 'Editar evento' : 'Nuevo evento'}</h2>
          {editing.id && (
            <button type="button" onClick={() => { setEditing(EMPTY); setImage(null); }} className="text-sm text-white/60">
              Cancelar
            </button>
          )}
        </div>
        <div>
          <label className="label">Título</label>
          <input className="field" required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Descripción</label>
          <textarea rows={4} className="field" required value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Fecha y hora</label>
            <AdminDateTimeField id="event-date" value={editing.date ? toDatetimeLocal(editing.date) : ''} onChange={(date) => setEditing({ ...editing, date })} />
          </div>
          <div>
            <label className="label">Lugar</label>
            <input className="field" value={editing.location || ''} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
          </div>
        </div>
        <div>
          <AdminFileInput
            id="event-image"
            file={image}
            currentImageUrl={editing.imageUrl}
            onChange={setImage}
          />
          {editing.imageUrl && <img src={asset(editing.imageUrl)} alt="" className="mt-2 h-32 rounded-lg object-cover" />}
        </div>
        <button className="btn-primary">{editing.id ? 'Actualizar' : 'Crear'}</button>
      </form>

      <div className="relative z-0 mt-8 space-y-3">
        {events.map((ev) => (
          <div key={ev.id} className="card p-4 flex items-center gap-4">
            {ev.imageUrl ? <img src={asset(ev.imageUrl)} alt="" className="h-14 w-20 rounded-lg object-cover" /> : <div className="h-14 w-20 rounded-lg bg-white/5" />}
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{ev.title}</div>
              <div className="text-xs text-white/50">{new Date(ev.date).toLocaleString('es-AR')}{ev.location ? ` · ${ev.location}` : ''}</div>
            </div>
            <button onClick={() => setEditing(ev)} className="btn-ghost text-sm">Editar</button>
            <button onClick={() => remove(ev)} className="text-sm text-red-300 hover:text-red-200 px-3 py-2">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
