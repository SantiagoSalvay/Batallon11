export default function FilePicker({
  id,
  label = 'Elegir archivo',
  accept = 'image/*',
  multiple = false,
  required = false,
  files = [],
  file = null,
  onChange,
}) {
  const selectedFiles = multiple ? files : file ? [file] : [];
  const summary = selectedFiles.length
    ? multiple
      ? `${selectedFiles.length} archivo${selectedFiles.length === 1 ? '' : 's'} seleccionado${selectedFiles.length === 1 ? '' : 's'}`
      : selectedFiles[0].name
    : 'Sin archivos seleccionados';

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label htmlFor={id} className="btn-ghost w-fit cursor-pointer text-sm">
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required}
        onChange={onChange}
        className="sr-only"
      />
      <span className="min-w-0 text-sm text-white/60 sm:truncate">{summary}</span>
    </div>
  );
}
