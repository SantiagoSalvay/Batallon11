import { Link } from 'react-router-dom';
import { usePageBackground } from '../context/PageBackgroundContext.jsx';

export default function NotFound() {
  const { darkMode } = usePageBackground();

  return (
    <div
      className={`grid min-h-screen place-items-center px-4 text-center ${
        darkMode ? 'bg-black text-white' : 'bg-stone-50 text-slate-900'
      }`}
    >
      <div>
        <p className={`font-display text-7xl font-extrabold ${darkMode ? 'text-sky-300' : 'text-blue-950'}`}>
          404
        </p>
        <h1 className="mt-4 text-2xl font-extrabold">Pagina no encontrada</h1>
        <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          El recurso solicitado no existe o fue movido.
        </p>
        <Link to="/" className="public-button-primary mt-6">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
