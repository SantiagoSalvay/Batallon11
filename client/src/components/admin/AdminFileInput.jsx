export default function AdminFileInput({
  id,
  label = 'Imagen',
  file,
  currentImageUrl,
  required = false,
  onChange,
}) {
  const inputKey = file ? `${file.name}-${file.lastModified}` : currentImageUrl || 'empty';
  const fileName = file?.name || (currentImageUrl ? 'Imagen actual cargada' : 'Sin archivo seleccionado');

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
      <input
        key={inputKey}
        id={id}
        type="file"
        accept="image/*"
        required={required}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="sr-only"
      />
    </div>
  );
}