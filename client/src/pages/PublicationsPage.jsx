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
      <div className="min-h-[60vh] grid place-items-center text-white/60 pt-24">
        Cargando…
      </div>
    );
  }

  return (
    <div className="pt-16">
      <div className="container-app pt-8 pb-2">
        <Link to="/" className="text-sm text-white/60 hover:text-white transition">
          ← Volver al inicio
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
