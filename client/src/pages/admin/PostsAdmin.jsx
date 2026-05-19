import { useEffect, useState } from 'react';
import { api, asset } from '../../services/api.js';

const EMPTY = { id: null, title: '', content: '', published: true };

export default function PostsAdmin() {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState(null);

  const load = () => api.get('/posts', { params: { limit: 100 } }).then((r) => setPosts(r.data));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const fd = new FormData();
      fd.append('title', editing.title);
      fd.append('content', editing.content);
      fd.append('published', String(editing.published));
      if (image) fd.append('image', image);

      if (editing.id) await api.put(`/posts/${editing.id}`, fd);
      else await api.post('/posts', fd);

      setEditing(EMPTY);
      setImage(null);
      await load();
      setStatus({ type: 'ok', msg: 'Publicación guardada' });
    } catch (err) {
      setStatus({ type: 'err', msg: err.response?.data?.message || 'Error al guardar' });
    }
  };

  const remove = async (p) => {
    if (!confirm(`Eliminar la publicación "${p.title}"?`)) return;
    await api.delete(`/posts/${p.id}`);
    await load();
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Publicaciones generales</h1>

      {status && (
        <div className={`mt-4 rounded-lg px-3 py-2 text-sm ${status.type === 'ok' ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30' : 'bg-red-500/10 text-red-200 border border-red-500/30'}`}>
          {status.msg}
        </div>
      )}

      <form onSubmit={submit} className="card p-6 mt-6 space-y-4 max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{editing.id ? 'Editar publicación' : 'Nueva publicación'}</h2>
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
          <label className="label">Contenido</label>
          <textarea rows={6} className="field" required value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
        </div>
        <div className="flex items-center gap-3">
          <input id="published" type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
          <label htmlFor="published" className="text-sm text-white/80">Publicada</label>
        </div>
        <div>
          <label className="label">Imagen</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="block text-sm text-white/70" />
          {editing.imageUrl && <img src={asset(editing.imageUrl)} alt="" className="mt-2 h-32 rounded-lg object-cover" />}
        </div>
        <button className="btn-primary">{editing.id ? 'Actualizar' : 'Crear'}</button>
      </form>

      <div className="mt-8 space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="card p-4 flex items-center gap-4">
            {p.imageUrl ? (
              <img src={asset(p.imageUrl)} alt="" className="h-14 w-20 rounded-lg object-cover" />
            ) : (
              <div className="h-14 w-20 rounded-lg bg-white/5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{p.title}</div>
              <div className="text-xs text-white/50">{new Date(p.createdAt).toLocaleString('es-AR')}</div>
            </div>
            <button onClick={() => setEditing(p)} className="btn-ghost text-sm">Editar</button>
            <button onClick={() => remove(p)} className="text-sm text-red-300 hover:text-red-200 px-3 py-2">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
