import { useEffect } from 'react';
import {
  buildTitle,
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_BRAND,
  LOCALE,
} from '../lib/seo.js';

const JSONLD_FLAG = 'data-seo-jsonld';

/** Crea o actualiza un <meta>/<link> identificándolo por el selector dado. */
function upsert(tag, selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(tag);
    document.head.appendChild(el);
  }
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
}

function setMetaByName(name, content) {
  upsert('meta', `meta[name="${name}"]`, { name, content });
}

function setMetaByProperty(property, content) {
  upsert('meta', `meta[property="${property}"]`, { property, content });
}

/**
 * Gestiona el <head> para SEO en esta SPA: título, descripción, canonical,
 * Open Graph, Twitter Cards y datos estructurados (JSON-LD).
 */
export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = typeof window !== 'undefined' ? window.location.pathname : '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd = null,
}) {
  useEffect(() => {
    const fullTitle = buildTitle(title);
    const canonical = absoluteUrl(path);
    const ogImage = absoluteUrl(image);

    document.title = fullTitle;
    setMetaByName('description', description);
    setMetaByName('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    upsert('link', 'link[rel="canonical"]', { rel: 'canonical', href: canonical });

    setMetaByProperty('og:title', fullTitle);
    setMetaByProperty('og:description', description);
    setMetaByProperty('og:type', type);
    setMetaByProperty('og:url', canonical);
    setMetaByProperty('og:image', ogImage);
    setMetaByProperty('og:site_name', SITE_BRAND);
    setMetaByProperty('og:locale', LOCALE);

    setMetaByName('twitter:card', 'summary_large_image');
    setMetaByName('twitter:title', fullTitle);
    setMetaByName('twitter:description', description);
    setMetaByName('twitter:image', ogImage);

    document.head
      .querySelectorAll(`script[${JSONLD_FLAG}]`)
      .forEach((node) => node.remove());

    const blocks = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
    for (const block of blocks) {
      if (!block) continue;
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute(JSONLD_FLAG, '');
      script.textContent = JSON.stringify(block);
      document.head.appendChild(script);
    }

    return () => {
      document.head
        .querySelectorAll(`script[${JSONLD_FLAG}]`)
        .forEach((node) => node.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, image, type, noindex, JSON.stringify(jsonLd)]);

  return null;
}
