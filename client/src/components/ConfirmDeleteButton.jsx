import { useEffect, useState } from 'react';

function errorMessage(error) {
  return error?.response?.data?.message || error?.message || 'No se pudo eliminar';
}

export default function ConfirmDeleteButton({
  message,
  onConfirm,
  children = 'Eliminar',
  className = 'text-sm text-red-300 hover:text-red-200 px-3 py-2',
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !pending) setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, pending]);

  const confirm = async () => {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 px-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            className="w-full max-w-sm rounded-xl border border-white/10 bg-ink-800 p-5 text-white shadow-2xl"
          >
            <h2 id="confirm-delete-title" className="font-display text-lg font-extrabold">
              Confirmar eliminación
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/70">{message}</p>
            {error && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="btn-ghost text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={pending}
                className="btn bg-red-600 text-white hover:bg-red-500 focus:ring-red-400"
              >
                {pending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
