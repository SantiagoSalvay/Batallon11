import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-ink-900 text-center px-4">
      <div>
        <p className="text-7xl font-extrabold text-gradient">404</p>
        <h1 className="mt-4 text-2xl font-bold">Página no encontrada</h1>
        <p className="mt-2 text-white/60">El recurso solicitado no existe o fue movido.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
