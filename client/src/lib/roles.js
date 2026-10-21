import { Shield, ShieldCheck, Compass } from 'lucide-react';

/**
 * Presentación de los tres roles del panel.
 *
 * Los permisos siguen viviendo en RoleRoute y en el servidor; esto es sólo
 * cómo se nombra y se distingue cada rol en la interfaz, para que quien entra
 * sepa de entrada qué alcance tiene.
 */
export const ROLES = {
  ADMIN: {
    label: 'Administrador',
    scope: 'Acceso completo al contenido del sitio',
    Icon: ShieldCheck,
    badgeClass: 'border-brand-400/40 bg-brand-500/15 text-brand-200',
  },
  EDITOR: {
    label: 'Editor',
    scope: 'Publicaciones, galería y eventos',
    Icon: Shield,
    badgeClass: 'border-accent-500/40 bg-accent-500/15 text-accent-500',
  },
  COORDINATOR: {
    label: 'Coordinador',
    scope: 'Contenido de una sola etapa',
    Icon: Compass,
    badgeClass: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300',
  },
};

export function roleInfo(role) {
  return ROLES[role] ?? {
    label: 'Sin rol',
    scope: 'Sin permisos asignados',
    Icon: Shield,
    badgeClass: 'border-white/20 bg-white/10 text-white/70',
  };
}
