import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Home from './pages/Home.jsx';
import PublicationsPage from './pages/PublicationsPage.jsx';
import StagePage from './pages/StagePage.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import StagesAdmin from './pages/admin/StagesAdmin.jsx';
import PostsAdmin from './pages/admin/PostsAdmin.jsx';
import StagePostsAdmin from './pages/admin/StagePostsAdmin.jsx';
import GalleryAdmin from './pages/admin/GalleryAdmin.jsx';
import StageGalleryAdmin from './pages/admin/StageGalleryAdmin.jsx';
import EventsAdmin from './pages/admin/EventsAdmin.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoleRoute from './components/RoleRoute.jsx';
import CoordinatorIndexRedirect from './components/CoordinatorIndexRedirect.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/publicaciones" element={<PublicationsPage />} />
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
        <Route index element={<CoordinatorIndexRedirect><Dashboard /></CoordinatorIndexRedirect>} />
        <Route path="etapas" element={<RoleRoute allow={['ADMIN', 'EDITOR']}><StagesAdmin /></RoleRoute>} />
        <Route path="publicaciones" element={<RoleRoute allow={['ADMIN', 'EDITOR']}><PostsAdmin /></RoleRoute>} />
        <Route path="publicaciones-etapa" element={<StagePostsAdmin />} />
        <Route path="galeria" element={<RoleRoute allow={['ADMIN', 'EDITOR']}><GalleryAdmin /></RoleRoute>} />
        <Route path="galeria-etapa" element={<StageGalleryAdmin />} />
        <Route path="eventos" element={<RoleRoute allow={['ADMIN', 'EDITOR']}><EventsAdmin /></RoleRoute>} />
      </Route>

      <Route path="*" element={<NotFound />} />
      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
