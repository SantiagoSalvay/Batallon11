import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import PostsList from '../components/PostsList.jsx';

export default function PublicationsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/posts', { params: { limit: 100 } })
      .then((r) => {
        if (!cancelled) setPosts(r.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
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
      <PostsList
        title="Todas las publicaciones"
        posts={posts}
        emptyText="Aún no hay publicaciones."
      />
    </div>
  );
}
