import { useEffect, useState } from 'react';
import { api, asset } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import AdminStatus from '../../components/AdminStatus.jsx';
import ConfirmDeleteButton from '../../components/ConfirmDeleteButton.jsx';

const EMPTY = { id: null, title: '', content: '', stageSlug: '', published: true };

export default function StagePostsAdmin() {
  const { user } = useAuth();
  const isCoordinator = user?.role === 'COORDINATOR';
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState('');
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.get('/stages').then((r) => {
      setStages(r.data);
      if (isCoordinator && user?.stageSlug) {
        setSelectedStage(user.stageSlug);
      } else if (r.data.length && !selectedStage) {
        setSelectedStage(r.data[0].slug);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const load = (stageSlug) => {
    if (!stageSlug) return Promise.resolve();
    return api.get('/stage-posts', { params: { stageSlug } }).then((r) => setPosts(r.data));
  };

  useEffect(() => {
    load(selectedStage);
  }, [selectedStage]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const fd = new FormData();
      fd.append('title', editing.title);
      fd.append('content', editing.content);
      fd.append('stageSlug', editing.stageSlug || selectedStage);
      fd.append('published', String(editing.published));
      if (image) fd.append('image', image);

      if (editing.id) await api.put(`/stage-posts/${editing.id}`, fd);
      else await api.post('/stage-posts', fd);

      setEditing(EMPTY);
      setImage(null);
      await load(selectedStage);
      setStatus({ type: 'ok', msg: 'Publicación guardada' });
    } catch (err) {
      setStatus({ type: 'err', msg: err.response?.data?.message || 'Error al guardar' });
    }
  };

  const remove = async (p) => {
    await api.delete(`/stage-posts/${p.id}`);
    await load(selectedStage);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Publicaciones por etapa</h1>

      <div className="mt-6">
        <label className="label">Etapa</label>
        {isCoordinator ? (
          <div className="field max-w-sm bg-white/5 cursor-not-allowed">
            {stages.find((s) => s.slug === selectedStage)?.name || '—'}
          </div>
        ) : (
          <select
            className="field max-w-sm"
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
          >
            {stages.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <AdminStatus status={status} />

      <form onSubmit={submit} className="card p-6 mt-6 space-y-4 max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{editing.id ? 'Editar publicación' : 'Nueva publicación'}</h2>
          {editing.id && (
            <button
              type="button"
              onClick={() => {
                setEditing(EMPTY);
                setImage(null);
              }}
              className="text-sm text-white/60"
            >
              Cancelar
            </button>
          )}
        </div>
        <div>
          <label className="label">Título</label>
          <input
            className="field"
            required
            value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Contenido</label>
          <textarea
            rows={5}
            className="field"
            required
            value={editing.content}
            onChange={(e) => setEditing({ ...editing, content: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            id="pp"
            type="checkbox"
            checked={editing.published}
            onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
          />
          <label htmlFor="pp" className="text-sm text-white/80">
            Publicada
          </label>
        </div>
        <div>
          <label className="label">Imagen</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="block text-sm text-white/70"
          />
          {editing.imageUrl && (
            <img src={asset(editing.imageUrl)} alt="" className="mt-2 h-32 rounded-lg object-cover" />
          )}
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
            <button
              onClick={() => setEditing({ ...p, stageSlug: p.stageSlug })}
              className="btn-ghost text-sm"
            >
              Editar
            </button>
            <ConfirmDeleteButton message={`Eliminar "${p.title}"?`} onConfirm={() => remove(p)} />
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-sm text-white/50">Sin publicaciones en esta etapa.</div>
        )}
      </div>
    </div>
  );
}
