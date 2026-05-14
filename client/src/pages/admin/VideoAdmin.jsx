import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

export default function VideoAdmin() {
  const [form, setForm] = useState({ videoUrl: '', title: '', subtitle: '' });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/video').then((r) => {
      setForm({
        videoUrl: r.data.videoUrl || '',
        title: r.data.title || '',
        subtitle: r.data.subtitle || '',
      });
    });
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await api.put('/video', form);
      setStatus({ type: 'ok', msg: 'Video actualizado' });
    } catch (err) {
      setStatus({ type: 'err', msg: err.response?.data?.message || 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Video institucional</h1>
      <p className="text-white/60 mt-1">Usá una URL de embed (YouTube/Vimeo).</p>

      <form onSubmit={onSubmit} className="card p-6 mt-6 space-y-4 max-w-2xl">
        {status && (
          <div className={`rounded-lg px-3 py-2 text-sm ${status.type === 'ok' ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30' : 'bg-red-500/10 text-red-200 border border-red-500/30'}`}>
            {status.msg}
          </div>
        )}

        <div>
          <label className="label">URL del video (embed)</label>
          <input
            className="field"
            placeholder="https://www.youtube.com/embed/..."
            value={form.videoUrl}
            onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Título</label>
          <input className="field" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div>
          <label className="label">Subtítulo</label>
          <input className="field" value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} />
        </div>

        {form.videoUrl && (
          <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
            <iframe src={form.videoUrl} title="Preview" className="h-full w-full" allowFullScreen />
          </div>
        )}

        <button className="btn-primary" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}
