import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (selectedFiles.length === 0 && inputRef.current) {
      inputRef.current.value = '';
    }
  }, [selectedFiles.length]);

  const fileName = (() => {
    if (selectedFiles.length === 1) return selectedFiles[0].name;
    if (selectedFiles.length > 1) return `${selectedFiles.length} archivos seleccionados`;
    return currentImageUrl ? 'Imagen actual cargada' : 'Sin archivo seleccionado';
  })();

  const handleChange = (e) => {
    const nextFiles = Array.from(e.target.files || []).slice(0, maxFiles);
    onChange(multiple ? nextFiles : nextFiles[0] || null);
  };

  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor={id} className="btn-ghost w-fit cursor-pointer text-sm">
          Seleccionar archivo
        </label>
        <span className="min-w-0 truncate text-sm text-white/60">{fileName}</span>
      </div>
      {multiple && (
        <div className="mt-1 text-xs text-white/45">Hasta {maxFiles} archivos</div>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        required={required}
        multiple={multiple}
        onChange={handleChange}
        className="sr-only"
      />
    </div>
  );
}