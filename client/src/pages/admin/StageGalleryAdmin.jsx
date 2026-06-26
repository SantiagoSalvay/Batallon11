import { useEffect, useState } from 'react';
import { api, asset } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import FilePicker from '../../components/FilePicker.jsx';

export default function StageGalleryAdmin() {
  const { user } = useAuth();
  const isCoordinator = user?.role === 'COORDINATOR';
  const [stages, setStages] = useState([]);
  const [stageSlug, setStageSlug] = useState('');
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.get('/stages').then((r) => {
      setStages(r.data);
      if (isCoordinator && user?.stageSlug) {
        setStageSlug(user.stageSlug);
      } else if (r.data.length && !stageSlug) {
        setStageSlug(r.data[0].slug);
      }
    });
  }, []); // eslint-disable-line

  const load = (slug) => {
    if (!slug) return;
    api.get('/stage-gallery', { params: { stageSlug: slug } }).then((r) => setImages(r.data));
  };

  useEffect(() => {
    load(stageSlug);
  }, [stageSlug]);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return setStatus({ type: 'err', msg: 'Seleccioná una imagen' });
    setStatus(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('caption', caption);
      fd.append('stageSlug', stageSlug);
      await api.post('/stage-gallery', fd);
      setFile(null);
      setCaption('');
      load(stageSlug);
      setStatus({ type: 'ok', msg: 'Imagen agregada' });
    } catch (err) {
      setStatus({ type: 'err', msg: err.response?.data?.message || 'Error al subir' });
    }
  };

  const remove = async (img) => {
    if (!confirm('Eliminar imagen?')) return;
    await api.delete(`/stage-gallery/${img.id}`);
    load(stageSlug);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Galerías por etapa</h1>

      <div className="mt-6">
        <label className="label">Etapa</label>
        {isCoordinator ? (
          
          <div className="field max-w-sm bg-white/5 cursor-not-allowed">
            {stages.find((s) => s.slug === stageSlug)?.name || '-'}
          </div>
        ) : (
          <select className="field max-w-sm" value={stageSlug} onChange={(e) => setStageSlug(e.target.value)}>
            {stages.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

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

      <form onSubmit={upload} className="card p-6 mt-6 space-y-4 max-w-2xl">
        <div>
          <label className="label">Imagen</label>
          <FilePicker id="stage-gallery-image" label="Elegir imagen" required file={file} onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label className="label">Título de foto(s)</label>
          <input className="field" value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        <button className="btn-primary">Subir imagen</button>
      </form>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="card overflow-hidden group relative">
            <img src={asset(img.imageUrl)} alt="" className="aspect-square w-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-end p-3">
              <button onClick={() => remove(img)} className="text-sm text-red-200 hover:text-red-100">
                Eliminar
              </button>
            </div>
            {img.caption && (
              <div className="px-3 py-2 text-xs text-white/70 truncate">{img.caption}</div>
            )}
          </div>
        ))}
        {images.length === 0 && (
          <div className="text-sm text-white/50 col-span-full">Sin imágenes en esta etapa.</div>
        )}
      </div>
    </div>
  );
}
