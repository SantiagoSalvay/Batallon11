import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Home from './pages/Home.jsx';
import StagePage from './pages/StagePage.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import HeroAdmin from './pages/admin/HeroAdmin.jsx';
import StagesAdmin from './pages/admin/StagesAdmin.jsx';
import PostsAdmin from './pages/admin/PostsAdmin.jsx';
import StagePostsAdmin from './pages/admin/StagePostsAdmin.jsx';
import GalleryAdmin from './pages/admin/GalleryAdmin.jsx';
import StageGalleryAdmin from './pages/admin/StageGalleryAdmin.jsx';
import EventsAdmin from './pages/admin/EventsAdmin.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/etapas/:slug" element={<StagePage />} />
      </Route>

      <Route path="/p/:token" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="hero" element={<HeroAdmin />} />
        <Route path="etapas" element={<StagesAdmin />} />
        <Route path="publicaciones" element={<PostsAdmin />} />
        <Route path="publicaciones-etapa" element={<StagePostsAdmin />} />
        <Route path="galeria" element={<GalleryAdmin />} />
        <Route path="galeria-etapa" element={<StageGalleryAdmin />} />
        <Route path="eventos" element={<EventsAdmin />} />
      </Route>

      <Route path="*" element={<NotFound />} />
      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
