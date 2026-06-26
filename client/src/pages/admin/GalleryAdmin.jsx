import { useEffect, useState } from 'react';
import { api, asset } from '../../services/api.js';
import FilePicker from '../../components/FilePicker.jsx';

export default function GalleryAdmin() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState(null);

  const load = () => api.get('/gallery').then((r) => setImages(r.data));

  useEffect(() => {
    load();
  }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return setStatus({ type: 'err', msg: 'Seleccioná una imagen' });
    setStatus(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('caption', caption);
      await api.post('/gallery', fd);
      setFile(null);
      setCaption('');
      await load();
      setStatus({ type: 'ok', msg: 'Imagen agregada' });
    } catch (err) {
      setStatus({ type: 'err', msg: err.response?.data?.message || 'Error al subir' });
    }
  };

  const remove = async (img) => {
    if (!confirm('Eliminar imagen?')) return;
    await api.delete(`/gallery/${img.id}`);
    await load();
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Galería general</h1>

      {status && (
        <div className={`mt-4 rounded-lg px-3 py-2 text-sm ${status.type === 'ok' ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30' : 'bg-red-500/10 text-red-200 border border-red-500/30'}`}>
          {status.msg}
        </div>
      )}

      <form onSubmit={upload} className="card p-6 mt-6 space-y-4 max-w-2xl">
        <div>
          <label className="label">Imagen</label>
          <FilePicker id="gallery-image" label="Elegir imagen" required file={file} onChange={(e) => setFile(e.target.files?.[0] || null)} />
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
              <button onClick={() => remove(img)} className="text-sm text-red-200 hover:text-red-100">Eliminar</button>
            </div>
            {img.caption && <div className="px-3 py-2 text-xs text-white/70 truncate">{img.caption}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
