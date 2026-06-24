import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import ListaPublicaciones from '../components/ListaPublicaciones.jsx';

export default function PublicacionesPage() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    let cancelado = false;
    api
      .get('/publicaciones', { params: { etapa: 'general', limite: 100 } })
      .then((respuesta) => {
        if (!cancelado) setPublicaciones(respuesta.data);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  if (cargando) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-stone-50 pt-24 text-slate-500">
        Cargando...
      </div>
    );
  }

  return (
    <div className="bg-stone-50 pt-16">
      <div className="container-app pb-2 pt-8">
        <Link to="/" className="text-sm font-semibold text-slate-500 transition hover:text-blue-950">
          {'<-'} Volver al inicio
        </Link>
      </div>
      <ListaPublicaciones
        titulo="Todas las publicaciones"
        publicaciones={publicaciones}
        textoVacio="Aun no hay publicaciones."
      />
    </div>
  );
}