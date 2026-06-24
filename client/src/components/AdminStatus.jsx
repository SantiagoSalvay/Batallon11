export default function AdminStatus({ status, className = '' }) {
  if (!status) return null;

  const styles = status.type === 'ok'
    ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30'
    : 'bg-red-500/10 text-red-200 border border-red-500/30';

  return (
    <div className={`mt-4 rounded-lg px-3 py-2 text-sm ${styles} ${className}`} role="status">
      {status.msg}
    </div>
  );
}
