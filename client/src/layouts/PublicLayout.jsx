import { Outlet } from 'react-router';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { usePageBackground } from '../context/PageBackgroundContext.jsx';

export default function PublicLayout() {
  const { darkMode } = usePageBackground();

  return (
    <div
      className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-300 ${
        darkMode ? 'page-dark bg-black text-white' : 'bg-stone-50 text-slate-900'
      }`}
    >
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
