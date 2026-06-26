// Configuración central de SEO del sitio.
// El dominio se puede sobreescribir con VITE_SITE_URL en el build.

export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://batallon11.com')
  .trim()
  .replace(/\/+$/, '');

export const SITE_BRAND = 'Batallón 11 General José María Paz';

export const DEFAULT_TITLE = `${SITE_BRAND} | Exploradores Argentinos de Don Bosco`;

export const DEFAULT_DESCRIPTION =
  'Sitio oficial del Batallón 11 General José María Paz, Exploradores Argentinos de Don Bosco en Córdoba. Conocé nuestras etapas, novedades, galería de fotos y cómo sumarte a la comunidad.';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/LogoBatallon11.png`;

export const LOCALE = 'es_AR';

/** Convierte una ruta relativa en URL absoluta usando SITE_URL. */
export function absoluteUrl(pathOrUrl = '/') {
  if (!pathOrUrl) return SITE_URL;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Compone el título final con la marca del batallón. */
export function buildTitle(title) {
  if (!title) return DEFAULT_TITLE;
  return `${title} | ${SITE_BRAND}`;
}

/** Datos estructurados de la organización (JSON-LD). */
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_BRAND,
    alternateName: 'Exploradores Argentinos de Don Bosco — Batallón 11',
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    image: DEFAULT_OG_IMAGE,
    description: DEFAULT_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Córdoba',
      addressRegion: 'Córdoba',
      addressCountry: 'AR',
    },
    areaServed: 'Córdoba, Argentina',
  };
}

/** Datos estructurados del sitio web (JSON-LD). */
export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_BRAND,
    url: SITE_URL,
    inLanguage: 'es-AR',
  };
}

/**
 * Migas de pan (BreadcrumbList) para JSON-LD.
 * items: [{ name, path }]
 */
export function breadcrumbLd(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
