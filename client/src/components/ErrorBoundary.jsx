import { Component } from 'react';

/**
 * Evita que un fallo de render deje la pantalla completamente vacía.
 * Sin este límite, cualquier excepción desmonta todo el árbol y solo queda
 * visible el fondo del layout.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info?.componentStack);
    }
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-stone-50 px-6 py-16 text-center text-slate-900">
        <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-900">
          Batallón 11
        </span>
        <h1 className="max-w-xl text-2xl font-extrabold sm:text-3xl">
          No pudimos mostrar esta sección
        </h1>
        <p className="max-w-md text-sm leading-6 text-slate-600">
          Ocurrió un problema al cargar el contenido. Podés reintentar; si vuelve
          a pasar, revisá que el servidor de la API esté disponible.
        </p>
        {import.meta.env.DEV && (
          <pre className="max-w-xl overflow-x-auto rounded-md border border-slate-300 bg-white px-4 py-3 text-left text-xs text-red-700">
            {String(error?.message || error)}
          </pre>
        )}
        <button
          type="button"
          onClick={this.handleReload}
          className="rounded-md bg-blue-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900"
        >
          Reintentar
        </button>
      </div>
    );
  }
}
