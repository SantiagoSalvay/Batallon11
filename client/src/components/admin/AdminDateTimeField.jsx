import { useEffect, useMemo, useRef, useState } from 'react';

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];
const WEEKDAYS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

function pad(value) {
  return String(value).padStart(2, '0');
}

function toLocalValue(date, time) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time}`;
}

function parseValue(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/);
  if (!match) return null;
  const [, year, month, day, time] = match;
  return {
    date: new Date(Number(year), Number(month) - 1, Number(day)),
    time,
  };
}

function sameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDisplay(value) {
  const parsed = parseValue(value);
  if (!parsed) return 'Seleccionar fecha y hora';
  const { date, time } = parsed;
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${time}`;
}

export default function AdminDateTimeField({ id, value, onChange }) {
  const rootRef = useRef(null);
  const parsed = parseValue(value);
  const selectedDate = parsed?.date || null;
  const selectedTime = parsed?.time || '12:00';
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const base = selectedDate || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const first = new Date(year, month, 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - mondayOffset);
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [visibleMonth]);

  const setDate = (date) => {
    onChange(toLocalValue(date, selectedTime));
  };

  const setTime = (time) => {
    const date = selectedDate || new Date();
    onChange(toLocalValue(date, time || '12:00'));
  };

  const shiftMonth = (amount) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const selectToday = () => {
    const now = new Date();
    onChange(toLocalValue(now, `${pad(now.getHours())}:${pad(now.getMinutes())}`));
    setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="field flex items-center justify-between gap-3 text-left"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={value ? 'text-white' : 'text-white/45'}>{formatDisplay(value)}</span>
        <span className="text-sm text-white/60">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-40 w-[20rem] max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-ink-900 p-4 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Mes anterior"
            >
              {'<'}
            </button>
            <div className="text-sm font-bold capitalize text-white">
              {MONTHS[visibleMonth.getMonth()]} de {visibleMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Mes siguiente"
            >
              {'>'}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.68rem] font-bold text-white/50">
            {WEEKDAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
              const isSelected = sameDay(day, selectedDate);
              const isToday = sameDay(day, new Date());
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setDate(day)}
                  className={`h-9 rounded-lg text-sm font-semibold transition ${
                    isSelected
                      ? 'bg-brand-500 text-white shadow-glow'
                      : isToday
                        ? 'border border-brand-400/60 text-white'
                        : isCurrentMonth
                          ? 'text-white hover:bg-white/10'
                          : 'text-white/35 hover:bg-white/5'
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-3 border-t border-white/10 pt-4">
            <div>
              <label className="label" htmlFor={`${id}-time`}>Hora</label>
              <input
                id={`${id}-time`}
                type="time"
                className="field admin-date-field py-2"
                value={selectedTime}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <button type="button" onClick={selectToday} className="btn-ghost px-3 py-2 text-sm">
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
