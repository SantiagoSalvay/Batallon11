import { useEffect, useRef, useState } from 'react';

export default function AdminFileInput({
  id,
  label = 'Imagen',
  file,
  files,
  currentImageUrl,
  required = false,
  multiple = false,
  maxFiles = 1,
  onChange,
}) {
  const inputRef = useRef(null);
  const selectedFiles = files ?? (Array.isArray(file) ? file : file ? [file] : []);
  const count = selectedFiles.length;

  // Firma estable para no regenerar las miniaturas en cada re-render.
  const signature = selectedFiles
    .map((f) => `${f.name}:${f.size}:${f.lastModified}`)
    .join('|');

  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (count === 0 && inputRef.current) {
      inputRef.current.value = '';
    }
  }, [count]);

  useEffect(() => {
    const urls = selectedFiles.map((f, index) => ({
      key: `${f.name}-${f.size}-${f.lastModified}-${index}`,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const emit = (nextList) => {
    onChange(multiple ? nextList : nextList[0] || null);
  };

  const handleChange = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;

    if (!multiple) {
      emit(picked.slice(0, 1));
      return;
    }

    // Acumula con lo ya elegido, evita duplicados y respeta el máximo.
    const merged = [...selectedFiles];
    for (const f of picked) {
      const isDup = merged.some((x) => x.name === f.name && x.size === f.size);
      if (!isDup) merged.push(f);
    }
    emit(merged.slice(0, maxFiles));
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeAt = (index) => {
    emit(selectedFiles.filter((_, i) => i !== index));
  };

  const reachedMax = multiple && count >= maxFiles;

  const statusText = (() => {
    if (count === 0) {
      return currentImageUrl ? 'Imagen actual cargada' : 'Sin archivo seleccionado';
    }
    if (!multiple) return selectedFiles[0].name;
    return `${count} foto${count > 1 ? 's' : ''} seleccionada${count > 1 ? 's' : ''}`;
  })();

  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label
          htmlFor={id}
          className={`btn-ghost w-fit cursor-pointer text-sm ${
            reachedMax ? 'pointer-events-none opacity-40' : ''
          }`}
        >
          {multiple ? 'Agregar fotos' : 'Seleccionar archivo'}
        </label>
        <span className="min-w-0 truncate text-sm text-white/60">{statusText}</span>
      </div>
      {multiple && (
        <div className="mt-1 text-xs text-white/45">
          Hasta {maxFiles} fotos{reachedMax ? ' (máximo alcanzado)' : ''}
        </div>
      )}

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((p, index) => (
            <div
              key={p.key}
              className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/5"
            >
              <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
              {multiple && (
                <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
                  {index + 1}
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/80 text-sm font-bold text-white transition hover:bg-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Quitar foto"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        required={required && count === 0}
        multiple={multiple}
        onChange={handleChange}
        className="sr-only"
      />
    </div>
  );
}
