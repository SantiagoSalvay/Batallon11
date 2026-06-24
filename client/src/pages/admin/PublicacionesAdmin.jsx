import { useEffect, useMemo, useState } from 'react';
import { api, asset } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import AdminStatus from '../../components/AdminStatus.jsx';
import ConfirmDeleteButton from '../../components/ConfirmDeleteButton.jsx';

const VACIA = {
  id: null,
  titulo: '',
  contenido: '',
  publicada: true,
  etapaSlug: null,
  imagenes: [],
};

export default function PublicacionesAdmin() {
  const { user } = useAuth();
  const esCoordinador = user?.role === 'COORDINATOR';
  const [etapas, setEtapas] = useState([]);
  const [alcance, setAlcance] = useState(esCoordinador ? user?.stageSlug || '' : 'general');
  const [publicaciones, setPublicaciones] = useState([]);
  const [edicion, setEdicion] = useState(VACIA);
  const [imagenes, setImagenes] = useState([]);
  const [status, setStatus] = useState(null);

  const nombreAlcance = useMemo(() => {
    if (alcance === 'general') return 'General';
    return etapas.find((etapa) => etapa.slug === alcance)?.name || 'Etapa';
  }, [alcance, etapas]);

  useEffect(() => {
    api.get('/etapas').then((respuesta) => {
      setEtapas(respuesta.data);
      if (esCoordinador && user?.stageSlug) setAlcance(user.stageSlug);
    });
  }, [esCoordinador, user?.stageSlug]);

  const cargar = async (valor = alcance) => {
    if (!valor) return;
    const respuesta = await api.get('/publicaciones', {
      params: { etapa: valor, limite: 100 },
    });
    setPublicaciones(respuesta.data);
  };

  useEffect(() => {
    cargar();
  }, [alcance]); // eslint-disable-line react-hooks/exhaustive-deps

  const cancelar = () => {
    setEdicion(VACIA);
    setImagenes([]);
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    setStatus(null);
    try {
      const datos = new FormData();
      datos.append('titulo', edicion.titulo);
      datos.append('contenido', edicion.contenido);
      datos.append('publicada', String(edicion.publicada));
      datos.append('etapaSlug', esCoordinador ? user.stageSlug : alcance);
      for (const imagen of imagenes) datos.append('imagenes', imagen);

      if (edicion.id) await api.put(`/publicaciones/${edicion.id}`, datos);
      else await api.post('/publicaciones', datos);

      cancelar();
      await cargar();
      setStatus({ type: 'ok', msg: 'Publicacion guardada' });
    } catch (error) {
      setStatus({ type: 'err', msg: error.response?.data?.message || 'Error al guardar' });
    }
  };

  const eliminar = async (publicacion) => {
    await api.delete(`/publicaciones/${publicacion.id}`);
    await cargar();
  };

  const eliminarImagen = async (publicacionId, imagenId) => {
    await api.delete(`/publicaciones/${publicacionId}/imagenes/${imagenId}`);
    const respuesta = await api.get(`/publicaciones/${publicacionId}`);
    setEdicion(respuesta.data);
    await cargar();
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Publicaciones</h1>

      <div className="mt-6">
        <label className="label">Alcance</label>
        {esCoordinador ? (
          <div className="field max-w-sm cursor-not-allowed bg-white/5">{nombreAlcance}</div>
        ) : (
          <select
            className="field max-w-sm"
            value={alcance}
            onChange={(evento) => {
              setAlcance(evento.target.value);
              cancelar();
            }}
          >
            <option value="general">General</option>
            {etapas.map((etapa) => (
              <option key={etapa.slug} value={etapa.slug}>{etapa.name}</option>
            ))}
          </select>
        )}
      </div>

      <AdminStatus status={status} />

      <form onSubmit={guardar} className="card mt-6 max-w-3xl space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{edicion.id ? 'Editar publicacion' : `Nueva publicacion - ${nombreAlcance}`}</h2>
          {edicion.id && <button type="button" onClick={cancelar} className="text-sm text-white/60">Cancelar</button>}
        </div>
        <div>
          <label className="label">Titulo</label>
          <input className="field" required value={edicion.titulo} onChange={(evento) => setEdicion({ ...edicion, titulo: evento.target.value })} />
        </div>
        <div>
          <label className="label">Contenido</label>
          <textarea rows={6} className="field" required value={edicion.contenido} onChange={(evento) => setEdicion({ ...edicion, contenido: evento.target.value })} />
        </div>
        <div className="flex items-center gap-3">
          <input id="publicada" type="checkbox" checked={edicion.publicada} onChange={(evento) => setEdicion({ ...edicion, publicada: evento.target.checked })} />
          <label htmlFor="publicada" className="text-sm text-white/80">Publicada</label>
        </div>
        <div>
          <label className="label">Imagenes (hasta 6 por carga)</label>
          <input type="file" accept="image/*" multiple onChange={(evento) => setImagenes(Array.from(evento.target.files || []).slice(0, 6))} className="block text-sm text-white/70" />
          {imagenes.length > 0 && <p className="mt-2 text-xs text-white/50">{imagenes.length} archivo(s) seleccionado(s)</p>}
        </div>

        {edicion.imagenes?.length > 0 && (
          <div>
            <div className="label">Imagenes actuales</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {edicion.imagenes.map((imagen) => (
                <div key={imagen.id} className="overflow-hidden rounded-lg border border-white/10">
                  <img src={asset(imagen.rutaOptimizada)} alt="" className="aspect-video w-full object-cover" />
                  <button type="button" onClick={() => eliminarImagen(edicion.id, imagen.id)} className="w-full px-2 py-2 text-xs text-red-300 hover:bg-red-500/10">Eliminar imagen</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn-primary">{edicion.id ? 'Actualizar' : 'Crear'}</button>
      </form>

      <div className="mt-8 space-y-3">
        {publicaciones.map((publicacion) => (
          <div key={publicacion.id} className="card flex items-center gap-4 p-4">
            {publicacion.imagenes?.[0] ? (
              <img src={asset(publicacion.imagenes[0].rutaOptimizada)} alt="" className="h-14 w-20 rounded-lg object-cover" />
            ) : (
              <div className="h-14 w-20 rounded-lg bg-white/5" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">{publicacion.titulo}</div>
              <div className="text-xs text-white/50">{new Date(publicacion.creadaEn).toLocaleString('es-AR')} Â· {publicacion.imagenes?.length || 0} imagen(es)</div>
            </div>
            <button onClick={() => setEdicion(publicacion)} className="btn-ghost text-sm">Editar</button>
            <ConfirmDeleteButton message={`Eliminar la publicacion "${publicacion.titulo}"?`} onConfirm={() => eliminar(publicacion)} />
          </div>
        ))}
        {publicaciones.length === 0 && <div className="text-sm text-white/50">Sin publicaciones en este alcance.</div>}
      </div>
    </div>
  );
}