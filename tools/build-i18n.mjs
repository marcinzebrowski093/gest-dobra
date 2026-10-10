#!/usr/bin/env node
/* ==========================================================================
   Gest Dobra – generator wersji językowych (bez zależności, Node 18+)

   Źródło prawdy:  index.html (PL) + i18n/{pl,en,el,ru}.json
   Wynik:          en/index.html, el/index.html, ru/index.html, sitemap.xml
                   oraz odświeżone bloki generowane w index.html
                   (<head>: title, opisy, canonical, hreflang, Open Graph, JSON-LD;
                   przełącznik języka).

   Uruchom po każdej zmianie treści:   node tools/build-i18n.mjs

   Oznaczenia w index.html:
     data-i18n="klucz"               – treść elementu z i18n/<lang>.json
                                       (klucze kończące się na „Html” wstawiane bez escapowania)
     data-i18n-attr="atr:klucz;…"    – wartości atrybutów (alt, aria-label, …)
     data-i18n-tpl="{klucz} 1: "     – treść z szablonu
     data-i18n-mode="last-word-brown" – ostatnie słowo w <span class="text-brown">
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// TODO: docelowa domena (np. https://gestdobra.pl/) – zmień i uruchom skrypt ponownie
const SITE = 'https://example.com/';

const LANGS = [
  { code: 'pl', dir: '', html: 'pl', hreflang: 'pl', og: 'pl_PL', ld: 'pl-PL', label: 'PL', name: 'Polski', flag: 'pl', ogImage: 'og-image.jpg' },
  { code: 'en', dir: 'en/', html: 'en-GB', hreflang: 'en', og: 'en_GB', ld: 'en-GB', label: 'GB', name: 'English', flag: 'gb', ogImage: 'og-image-en.jpg' },
  { code: 'el', dir: 'el/', html: 'el', hreflang: 'el', og: 'el_GR', ld: 'el-GR', label: 'GR', name: 'Ελληνικά', flag: 'gr', ogImage: 'og-image-el.jpg', fonts: ['inter-var-el.woff2'] },
  { code: 'ru', dir: 'ru/', html: 'ru', hreflang: 'ru', og: 'ru_RU', ld: 'ru-RU', label: 'RU', name: 'Русский', flag: 'ru', ogImage: 'og-image-ru.jpg', fonts: ['inter-var-ru.woff2'] },
];

const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const write = (f, s) => {
  const p = path.join(ROOT, f);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const old = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  if (old !== s) { fs.writeFileSync(p, s); console.log('  zapisano', f); }
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => esc(s).replace(/"/g, '&quot;');

const dict = Object.fromEntries(LANGS.map((l) => [l.code, JSON.parse(read(`i18n/${l.code}.json`))]));
const t = (lang, key) => {
  const v = dict[lang.code][key];
  if (v === undefined) throw new Error(`Brak klucza „${key}” w i18n/${lang.code}.json`);
  return v;
};

/* ---------- bloki generowane ---------- */
const relHref = (from, to) => (from.dir ? (to.dir ? '../' + to.dir : '../') : (to.dir || './'));

function headBlock(lang) {
  const title = t(lang, 'meta.title');
  const lines = [
    `  <title>${esc(title)}</title>`,
    `  <meta name="description" content="${escAttr(t(lang, 'meta.description'))}">`,
    `  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">`,
    `  <link rel="canonical" href="${SITE}${lang.dir}">`,
    ...LANGS.map((l) => `  <link rel="alternate" hreflang="${l.hreflang}" href="${SITE}${l.dir}">`),
    `  <link rel="alternate" hreflang="x-default" href="${SITE}">`,
    `  <meta property="og:type" content="website">`,
    `  <meta property="og:locale" content="${lang.og}">`,
    ...LANGS.filter((l) => l !== lang).map((l) => `  <meta property="og:locale:alternate" content="${l.og}">`),
    `  <meta property="og:site_name" content="Gest Dobra">`,
    `  <meta property="og:title" content="${escAttr(title)}">`,
    `  <meta property="og:description" content="${escAttr(t(lang, 'meta.ogDescription'))}">`,
    `  <meta property="og:url" content="${SITE}${lang.dir}">`,
    `  <meta property="og:image" content="${SITE}assets/img/${lang.ogImage}">`,
    `  <meta property="og:image:width" content="1200">`,
    `  <meta property="og:image:height" content="630">`,
    `  <meta property="og:image:alt" content="${escAttr(t(lang, 'meta.ogImageAlt'))}">`,
    `  <meta name="twitter:card" content="summary_large_image">`,
    // font tekstu w alfabecie danego języka (greka / cyrylica) – reszta ładuje się, gdy jest potrzebna
    ...(lang.fonts || []).map((f) => `  <link rel="preload" href="assets/fonts/${f}" as="font" type="font/woff2" crossorigin>`),
  ];
  return lines.join('\n') + '\n';
}

function jsonldBlock(lang) {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization', '@id': `${SITE}#organization`, name: 'Gest Dobra', url: SITE,
        logo: { '@type': 'ImageObject', url: `${SITE}assets/img/icon-512.png`, width: 512, height: 512 },
        slogan: 'Przyjmij dobro i, jeśli chcesz, przekaż je dalej.',
      },
      {
        '@type': 'WebSite', '@id': `${SITE}#website`, url: SITE, name: 'Gest Dobra',
        inLanguage: LANGS.map((l) => l.ld), publisher: { '@id': `${SITE}#organization` },
      },
      {
        '@type': 'WebPage', '@id': `${SITE}${lang.dir}#webpage`, url: `${SITE}${lang.dir}`,
        name: t(lang, 'meta.title'), description: t(lang, 'meta.description'), inLanguage: lang.ld,
        isPartOf: { '@id': `${SITE}#website` }, about: { '@id': `${SITE}#organization` },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE}assets/img/${lang.ogImage}`, width: 1200, height: 630 },
      },
    ],
  };
  const json = JSON.stringify(data, null, 2).replace(/</g, '\\u003c').split('\n').map((l) => '  ' + l).join('\n');
  return `  <script type="application/ld+json">\n${json}\n  </script>\n`;
}

function langBlock(lang) {
  const opt = (l) => {
    const cur = l === lang;
    return `              <li><a class="lang__option${cur ? ' is-active' : ''}" href="${relHref(lang, l)}" hreflang="${l.hreflang}" lang="${l.html}"${cur ? ' aria-current="page"' : ''}>` +
      `<img class="flag" src="assets/img/flags/${l.flag}.svg" width="24" height="16" alt="">` +
      `<span class="lang__code">${l.label}</span><span class="visually-hidden"> – ${esc(l.name)}</span>` +
      `${cur ? '<span class="lang__check" aria-hidden="true">✓</span>' : ''}</a></li>`;
  };
  return [
    `        <div class="lang" data-lang>`,
    `          <button class="lang__toggle" type="button" aria-expanded="false" aria-controls="lang-menu" data-lang-toggle>`,
    `            <img class="flag" src="assets/img/flags/${lang.flag}.svg" width="24" height="16" alt="">`,
    `            <span class="lang__code" aria-hidden="true">${lang.label}</span>`,
    `            <span class="visually-hidden">${esc(t(lang, 'ui.langToggle'))}</span>`,
    `            <svg class="lang__chevron" width="12" height="8" viewBox="0 0 14 9" aria-hidden="true" focusable="false"><path d="M1.5 1.5 7 7l5.5-5.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    `          </button>`,
    `          <ul class="lang__menu" id="lang-menu" role="list" hidden>`,
    ...LANGS.map(opt),
    `          </ul>`,
    `        </div>`,
  ].join('\n') + '\n';
}

function replaceBlock(html, name, content) {
  const re = new RegExp(`(<!-- i18n:${name}\\b[^>]*-->\\n)[\\s\\S]*?(\\s*<!-- /i18n:${name} -->)`);
  if (!re.test(html)) throw new Error(`Brak znaczników bloku i18n:${name}`);
  return html.replace(re, (_, a, b) => a + content + b.replace(/^\n/, ''));
}

/* ---------- tłumaczenie treści ---------- */
function setAttr(tag, name, value) {
  const re = new RegExp(`(\\s${name}=")[^"]*(")`);
  return re.test(tag) ? tag.replace(re, `$1${escAttr(value)}$2`) : tag.replace(/\s*\/?>$/, (m) => ` ${name}="${escAttr(value)}"${m}`);
}

function translateBody(html, lang) {
  // atrybuty
  html = html.replace(/<[a-z][a-z0-9]*\b[^>]*\sdata-i18n-attr="([^"]+)"[^>]*>/g, (tag, spec) => {
    for (const pair of spec.split(';')) {
      const [attr, key] = pair.split(':');
      tag = setAttr(tag, attr.trim(), t(lang, key.trim()));
    }
    return tag;
  });
  // treść
  html = html.replace(/<([a-z][a-z0-9]*)((?:\s[^>]*?)?\sdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g, (m, tag, attrs, key) => {
    const value = t(lang, key);
    let inner = key.endsWith('Html') ? value : esc(value);
    if (/data-i18n-mode="last-word-brown"/.test(attrs)) {
      const i = value.lastIndexOf(' ');
      inner = `${esc(value.slice(0, i))} <span class="text-brown">${esc(value.slice(i + 1))}</span>`;
    }
    return `<${tag}${attrs.replace(' data-i18n="', ' data-i18n-done="')}>${inner}</${tag}>`;
  });
  // szablony
  html = html.replace(/<([a-z][a-z0-9]*)((?:\s[^>]*?)?\sdata-i18n-tpl="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g, (m, tag, attrs, tpl) =>
    `<${tag}${attrs.replace(' data-i18n-tpl="', ' data-i18n-done-tpl="')}>${esc(tpl.replace(/\{([^}]+)\}/g, (_, k) => t(lang, k)))}</${tag}>`);
  return html;
}

const stripMarkers = (html) => html.replace(/\s(data-i18n|data-i18n-done|data-i18n-attr|data-i18n-mode|data-i18n-tpl|data-i18n-done-tpl)="[^"]*"/g, '');

function prefixPaths(html, prefix) {
  const skip = /^(#|[a-z][a-z0-9+.-]*:|\/|\.\.\/|\.\/)/i;
  html = html.replace(/\s(src|href)="([^"]+)"/g, (m, a, v) => (skip.test(v) ? m : ` ${a}="${prefix}${v}"`));
  html = html.replace(/\ssrcset="([^"]+)"/g, (m, v) =>
    ` srcset="${v.split(',').map((c) => { const s = c.trim(); return skip.test(s) ? s : prefix + s; }).join(', ')}"`);
  return html;
}

/* ---------- budowanie ---------- */
const PL = LANGS[0];
let source = read('index.html');
source = replaceBlock(source, 'head', headBlock(PL));
source = replaceBlock(source, 'jsonld', jsonldBlock(PL));
source = replaceBlock(source, 'lang', langBlock(PL));
console.log('Gest Dobra – wersje językowe');
write('index.html', source);

for (const lang of LANGS.slice(1)) {
  let html = source;
  html = replaceBlock(html, 'head', headBlock(lang));
  html = replaceBlock(html, 'jsonld', jsonldBlock(lang));
  html = replaceBlock(html, 'lang', langBlock(lang));
  html = html.replace(/<html lang="[^"]*"/, `<html lang="${lang.html}"`);
  html = translateBody(html, lang);
  // w EL/RU nagłówki serif używają innego alfabetu – preload łacińskiego Bodoni tylko spowalniałby pierwszy ekran
  if (lang.fonts) html = html.replace(/\n\s*<link rel="preload" href="assets\/fonts\/bodoni-moda-var-pl\.woff2"[^>]*>/, '');
  // kontrola: każdy znacznik treści musi zostać przetłumaczony
  const missed = html.match(/\sdata-i18n(-tpl)?="[^"]*"/g);
  if (missed) throw new Error(`${lang.code}: nieprzetłumaczone elementy: ${missed.join(', ')}`);
  html = stripMarkers(html);
  html = prefixPaths(html, '../');
  html = html.replace('<!doctype html>\n', `<!doctype html>\n<!-- Plik wygenerowany automatycznie (tools/build-i18n.mjs) z index.html + i18n/${lang.code}.json – nie edytuj ręcznie. -->\n`);
  write(`${lang.dir}index.html`, html);
}

// sitemap.xml z alternatywami językowymi
const today = new Date().toISOString().slice(0, 10);
const alt = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${SITE}${l.dir}"/>`).join('\n') +
  `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}"/>`;
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Plik wygenerowany przez tools/build-i18n.mjs. Domena: stała SITE w tym skrypcie. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGS.map((l) => `  <url>\n    <loc>${SITE}${l.dir}</loc>\n    <lastmod>${today}</lastmod>\n${alt}\n  </url>`).join('\n')}
</urlset>
`);
console.log('Gotowe.');
