import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import PostsList from '../components/PostsList.jsx';
import Seo from '../components/Seo.jsx';
import { localStageBySlug } from '../lib/stages.js';
import { breadcrumbLd } from '../lib/seo.js';

export default function StagePublicationsPage() {
  const { slug } = useParams();
  const stage = localStageBySlug(slug);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get(`/stages/${slug}/posts`)
      .then((r) => {
        if (!cancelled) setPosts(r.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!stage) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-stone-50 px-4 pt-24 text-slate-700">
        <div className="text-center">
          <p>Etapa no encontrada</p>
          <Link to="/" className="public-button-primary mt-4">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const seo = (
    <Seo
      title={`Publicaciones de ${stage.name}`}
      description={`Publicaciones y novedades de la etapa ${stage.name} del Batallón 11 General José María Paz.`}
      path={`/etapas/${slug}/publicaciones`}
      jsonLd={breadcrumbLd([
        { name: 'Inicio', path: '/' },
        { name: stage.name, path: `/etapas/${slug}` },
        { name: 'Publicaciones', path: `/etapas/${slug}/publicaciones` },
      ])}
    />
  );

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-stone-50 pt-24 text-slate-500">
        {seo}
        Cargando...
      </div>
    );
  }

  return (
    <div className="bg-stone-50 pt-16">
      {seo}
      <div className="container-app pb-2 pt-8">
        <Link
          to={`/etapas/${slug}`}
          className="text-sm font-semibold text-slate-500 transition hover:text-blue-950"
        >
          {'<-'} Volver a {stage.name}
        </Link>
      </div>
      {error ? (
        <div className="container-app py-8 text-sm text-red-700">{error}</div>
      ) : (
        <PostsList
          title={`Publicaciones de ${stage.name}`}
          posts={posts}
          emptyText="Aún no hay publicaciones en esta etapa."
        />
      )}
    </div>
  );
}
