/**
 * Variantes de animación compartidas por todo el sitio.
 *
 * Una sola fuente de verdad para que las entradas, los escalonados y los
 * hover se sientan parte del mismo sistema y no de cada pantalla por su lado.
 * La preferencia de "reducir movimiento" se respeta globalmente con
 * <MotionConfig reducedMotion="user"> en main.jsx, así que acá no hace falta
 * repetir esa comprobación.
 */

// Salida suave, sin rebote: apropiada para un tono institucional.
export const EASE_OUT = [0.16, 1, 0.3, 1];

export const DURATION = {
  fast: 0.28,
  base: 0.55,
  slow: 0.9,
};

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.base, ease: EASE_OUT } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

// Regla horizontal que se dibuja de izquierda a derecha.
export const drawRule = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: DURATION.slow, ease: EASE_OUT },
  },
};

export function stagger(gap = 0.08, delay = 0) {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: gap, delayChildren: delay } },
  };
}

// Config de viewport reutilizable: anima una sola vez, cuando ya se ve un
// trozo real del elemento (evita disparos a destiempo en móvil).
export const inView = { once: true, amount: 0.2 };
export const inViewSoft = { once: true, amount: 0.05 };

// Interacción estándar de tarjetas y botones.
export const liftOnHover = {
  rest: { y: 0 },
  hover: { y: -4, transition: { duration: DURATION.fast, ease: EASE_OUT } },
};
