import { useEffect, useState } from 'react';
import { api, asset } from '../../services/api.js';

export default function StageGalleryAdmin() {
  const [stages, setStages] = useState([]);
  const [stageId, setStageId] = useState('');
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [order, setOrder] = useState(0);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.get('/stages').then((r) => {
      setStages(r.data);
      if (r.data.length && !stageId) setStageId(String(r.data[0].id));
    });
  }, []); // eslint-disable-line

  const load = (sid) => {
    if (!sid) return;
    api.get('/stage-gallery', { params: { stageId: sid } }).then((r) => setImages(r.data));
  };

  useEffect(() => {
    load(stageId);
  }, [stageId]);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return setStatus({ type: 'err', msg: 'Seleccioná una imagen' });
    setStatus(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('caption', caption);
      fd.append('order', String(order));
      fd.append('stageId', String(stageId));
      await api.post('/stage-gallery', fd);
      setFile(null);
      setCaption('');
      setOrder(0);
      load(stageId);
      setStatus({ type: 'ok', msg: 'Imagen agregada' });
    } catch (err) {
      setStatus({ type: 'err', msg: err.response?.data?.message || 'Error al subir' });
    }
  };

  const remove = async (img) => {
    if (!confirm('Eliminar imagen?')) return;
    await api.delete(`/stage-gallery/${img.id}`);
    load(stageId);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Galerías por etapa</h1>

      <div className="mt-6">
        <label className="label">Etapa</label>
        <select className="field max-w-sm" value={stageId} onChange={(e) => setStageId(e.target.value)}>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {status && (
        <div className={`mt-4 rounded-lg px-3 py-2 text-sm ${status.type === 'ok' ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30' : 'bg-red-500/10 text-red-200 border border-red-500/30'}`}>
          {status.msg}
        </div>
      )}

      <form onSubmit={upload} className="card p-6 mt-6 space-y-4 max-w-2xl">
        <div>
          <label className="label">Imagen</label>
          <input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files?.[0] || null)} className="block text-sm text-white/70" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Caption</label>
            <input className="field" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <div>
            <label className="label">Orden</label>
            <input type="number" className="field" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
          </div>
        </div>
        <button className="btn-primary">Subir imagen</button>
      </form>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="card overflow-hidden group relative">
            <img src={asset(img.imageUrl)} alt="" className="aspect-square w-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-end p-3">
              <button onClick={() => remove(img)} className="text-sm text-red-200 hover:text-red-100">Eliminar</button>
            </div>
            {img.caption && <div className="px-3 py-2 text-xs text-white/70 truncate">{img.caption}</div>}
          </div>
        ))}
        {images.length === 0 && <div className="text-sm text-white/50 col-span-full">Sin imágenes en esta etapa.</div>}
      </div>
    </div>
  );
}
