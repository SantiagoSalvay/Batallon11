import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-stone-50 px-4 text-center text-slate-900">
      <div>
        <p className="font-display text-7xl font-extrabold text-blue-950">404</p>
        <h1 className="mt-4 text-2xl font-extrabold">Pagina no encontrada</h1>
        <p className="mt-2 text-slate-600">
          El recurso solicitado no existe o fue movido.
        </p>
        <Link to="/" className="public-button-primary mt-6">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
