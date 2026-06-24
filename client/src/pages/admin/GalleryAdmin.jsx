import { useEffect, useState } from 'react';
import { api, asset } from '../../services/api.js';
import AdminStatus from '../../components/AdminStatus.jsx';
import ConfirmDeleteButton from '../../components/ConfirmDeleteButton.jsx';

export default function GalleryAdmin() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [order, setOrder] = useState(0);
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
      fd.append('order', String(order));
      await api.post('/gallery', fd);
      setFile(null);
      setCaption('');
      setOrder(0);
      await load();
      setStatus({ type: 'ok', msg: 'Imagen agregada' });
    } catch (err) {
      setStatus({ type: 'err', msg: err.response?.data?.message || 'Error al subir' });
    }
  };

  const remove = async (img) => {
    await api.delete(`/gallery/${img.id}`);
    await load();
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Galería general</h1>

      <AdminStatus status={status} />

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
              <ConfirmDeleteButton message="Eliminar imagen?" onConfirm={() => remove(img)} className="text-sm text-red-200 hover:text-red-100" />
            </div>
            {img.caption && <div className="px-3 py-2 text-xs text-white/70 truncate">{img.caption}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
