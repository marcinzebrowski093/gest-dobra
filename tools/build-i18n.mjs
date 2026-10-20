#!/usr/bin/env node
/* ==========================================================================
   Gest Dobra – generator wersji językowych (bez zależności, Node 18+)

   Źródła (PL):   index.html, chce-zrozumiec-wiecej.html + i18n/{pl,en,el,ru}.json
   Wynik:         en/, el/, ru/ (strony w każdym języku), sitemap.xml
                  oraz odświeżone bloki generowane w źródłach PL
                  (<head>: title, opisy, canonical, hreflang, Open Graph, JSON-LD;
                  przełącznik języka).

   Uruchom po każdej zmianie treści:   node tools/build-i18n.mjs

   Oznaczenia w HTML:
     data-i18n="klucz"                – treść elementu z i18n/<lang>.json
                                        (klucze kończące się na „Html” wstawiane bez escapowania)
     data-i18n-attr="atr:klucz;…"     – wartości atrybutów (alt, aria-label, …)
     data-i18n-tpl="{klucz} 1: "      – treść z szablonu
     data-i18n-mode="last-word-brown" – ostatnie słowo w <span class="text-brown">
     data-i18n-mode="brand"           – „Gest Dobra” w <span class="brand"> (krój szeryfowy)
   Linki między podstronami zapisuj jako href="./nazwa-pliku-pl.html#kotwica" –
   generator podmieni nazwę pliku na odpowiednik w danym języku.
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// docelowa domena – po zmianie uruchom skrypt ponownie
const SITE = 'https://gestdobra.pl/';

// wersja obrazków Open Graph – podbij po każdej zmianie og-image*.jpg (komunikatory i przeglądarki cache'ują je długo)
const OG_VER = '2';

const LANGS = [
  { code: 'pl', dir: '', html: 'pl', hreflang: 'pl', og: 'pl_PL', ld: 'pl-PL', label: 'PL', name: 'Polski', flag: 'pl', ogImage: 'og-image.jpg' },
  { code: 'en', dir: 'en/', html: 'en-GB', hreflang: 'en', og: 'en_GB', ld: 'en-GB', label: 'GB', name: 'English', flag: 'uk', ogImage: 'og-image-en.jpg' },
  { code: 'el', dir: 'el/', html: 'el', hreflang: 'el', og: 'el_GR', ld: 'el-GR', label: 'GR', name: 'Ελληνικά', flag: 'gr', ogImage: 'og-image-el.jpg', fonts: ['inter-var-el.woff2'], headingFont: 'brygada-1918-var-el.woff2' },
  { code: 'ru', dir: 'ru/', html: 'ru', hreflang: 'ru', og: 'ru_RU', ld: 'ru-RU', label: 'RU', name: 'Русский', flag: 'ru', ogImage: 'og-image-ru.jpg', fonts: ['inter-var-ru.woff2'], headingFont: 'brygada-1918-var-ru.woff2' },
];

// Strony serwisu – adresy jak na dotychczasowej gestdobra.pl (zachowanie linków i pozycji w Google)
const PAGES = [
  { id: 'home', src: 'index.html', meta: 'meta', files: { pl: 'index.html', en: 'en/index.html', el: 'el/index.html', ru: 'ru/index.html' } },
  { id: 'how', src: 'chce-zrozumiec-wiecej.html', meta: 'sub.meta', files: { pl: 'chce-zrozumiec-wiecej.html', en: 'en/how-it-works.html', el: 'el/pos-leitourgei.html', ru: 'ru/kak-eto-rabotaet.html' } },
];
const HOME = PAGES[0];

const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const write = (f, s) => {
  const p = path.join(ROOT, f);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const old = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  if (old !== s) { fs.writeFileSync(p, s); console.log('  zapisano', f); }
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => esc(s).replace(/"/g, '&quot;');
const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '\u00a0').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

const dict = Object.fromEntries(LANGS.map((l) => [l.code, JSON.parse(read(`i18n/${l.code}.json`))]));
const t = (lang, key) => {
  const v = dict[lang.code][key];
  if (v === undefined) throw new Error(`Brak klucza „${key}” w i18n/${lang.code}.json`);
  return v;
};

/* ---------- adresy ---------- */
const pageUrl = (page, lang) => SITE + page.files[lang.code].replace(/(^|\/)index\.html$/, '$1');
function rel(fromFile, toFile) {
  let r = path.posix.relative(path.posix.dirname(fromFile), toFile);
  if (r === 'index.html') return './';
  if (r.endsWith('/index.html')) r = r.slice(0, -'index.html'.length);
  if (!r.startsWith('.')) r = './' + r;
  return r;
}

/* ---------- bloki generowane ---------- */
function headBlock(page, lang) {
  const title = t(lang, `${page.meta}.title`);
  const lines = [
    `  <title>${esc(title)}</title>`,
    `  <meta name="description" content="${escAttr(t(lang, `${page.meta}.description`))}">`,
    `  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">`,
    `  <link rel="canonical" href="${pageUrl(page, lang)}">`,
    ...LANGS.map((l) => `  <link rel="alternate" hreflang="${l.hreflang}" href="${pageUrl(page, l)}">`),
    `  <link rel="alternate" hreflang="x-default" href="${pageUrl(page, LANGS[0])}">`,
    `  <meta property="og:type" content="website">`,
    `  <meta property="og:locale" content="${lang.og}">`,
    ...LANGS.filter((l) => l !== lang).map((l) => `  <meta property="og:locale:alternate" content="${l.og}">`),
    `  <meta property="og:site_name" content="Gest Dobra">`,
    `  <meta property="og:title" content="${escAttr(title)}">`,
    `  <meta property="og:description" content="${escAttr(t(lang, `${page.meta}.ogDescription`))}">`,
    `  <meta property="og:url" content="${pageUrl(page, lang)}">`,
    `  <meta property="og:image" content="${SITE}assets/img/${lang.ogImage}?v=${OG_VER}">`,
    `  <meta property="og:image:width" content="1200">`,
    `  <meta property="og:image:height" content="630">`,
    `  <meta property="og:image:alt" content="${escAttr(t(lang, 'meta.ogImageAlt'))}">`,
    `  <meta name="twitter:card" content="summary_large_image">`,
    // font tekstu w alfabecie danego języka (greka / cyrylica) – reszta ładuje się, gdy jest potrzebna
    ...(lang.fonts || []).map((f) => `  <link rel="preload" href="assets/fonts/${f}" as="font" type="font/woff2" crossorigin>`),
    // nagłówek na pierwszym ekranie jest w Brygadzie – font alfabetu musi być gotowy od razu (brak przesunięć układu)
    ...(lang.headingFont ? [`  <link rel="preload" href="assets/fonts/${lang.headingFont}" as="font" type="font/woff2" crossorigin>`] : []),
  ];
  return lines.join('\n') + '\n';
}

// tekst elementu oznaczonego kluczem (w źródle PL lub w przetłumaczonej stronie)
function textOf(html, key) {
  const m = html.match(new RegExp(`<([a-z][a-z0-9]*)[^>]*\\sdata-i18n(?:-done)?="${key.replace(/\./g, '\\.')}"[^>]*>([\\s\\S]*?)<\\/\\1>`));
  if (!m) throw new Error(`Nie znaleziono elementu z kluczem ${key}`);
  return decode(m[2]);
}

function jsonldBlock(page, lang, html) {
  const graph = [
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
      '@type': 'WebPage', '@id': `${pageUrl(page, lang)}#webpage`, url: pageUrl(page, lang),
      name: t(lang, `${page.meta}.title`), description: t(lang, `${page.meta}.description`), inLanguage: lang.ld,
      isPartOf: { '@id': `${SITE}#website` }, about: { '@id': `${SITE}#organization` },
      primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE}assets/img/${lang.ogImage}?v=${OG_VER}`, width: 1200, height: 630 },
      ...(page.id !== 'home' ? { breadcrumb: { '@id': `${pageUrl(page, lang)}#breadcrumb` } } : {}),
    },
  ];
  if (page.id === 'how') {
    graph.push({
      '@type': 'BreadcrumbList', '@id': `${pageUrl(page, lang)}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: textOf(html, 'sub.crumb.home'), item: pageUrl(HOME, lang) },
        { '@type': 'ListItem', position: 2, name: textOf(html, 'sub.crumb.current'), item: pageUrl(page, lang) },
      ],
    });
    const qa = [];
    for (let i = 1; i <= 6; i++) qa.push({ '@type': 'Question', name: textOf(html, `sub.faq.q${i}`), acceptedAnswer: { '@type': 'Answer', text: textOf(html, `sub.faq.a${i}`) } });
    graph.push({ '@type': 'FAQPage', '@id': `${pageUrl(page, lang)}#faq`, inLanguage: lang.ld, isPartOf: { '@id': `${pageUrl(page, lang)}#webpage` }, mainEntity: qa });
  }
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
    .replace(/</g, '\\u003c').split('\n').map((l) => '  ' + l).join('\n');
  return `  <script type="application/ld+json">\n${json}\n  </script>\n`;
}

function langBlock(page, lang) {
  const from = page.files[lang.code];
  const opt = (l) => {
    const cur = l === lang;
    return `              <li><a class="lang__option${cur ? ' is-active' : ''}" href="${rel(from, page.files[l.code])}" hreflang="${l.hreflang}" lang="${l.html}"${cur ? ' aria-current="page"' : ''}>` +
      `<img class="flag" src="assets/img/flags/${l.flag}.svg" width="24" height="16" alt="" loading="lazy" decoding="async">` +
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
    if (/data-i18n-mode="brand"/.test(attrs)) inner = inner.replace(/Gest Dobra[?.!]?/, (b) => `<span class="brand">${b}</span>`);
    return `<${tag}${attrs.replace(' data-i18n="', ' data-i18n-done="')}>${inner}</${tag}>`;
  });
  // szablony
  html = html.replace(/<([a-z][a-z0-9]*)((?:\s[^>]*?)?\sdata-i18n-tpl="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g, (m, tag, attrs, tpl) =>
    `<${tag}${attrs.replace(' data-i18n-tpl="', ' data-i18n-done-tpl="')}>${esc(tpl.replace(/\{([^}]+)\}/g, (_, k) => t(lang, k)))}</${tag}>`);
  return html;
}

const stripMarkers = (html) => html.replace(/\s(data-i18n|data-i18n-done|data-i18n-attr|data-i18n-mode|data-i18n-tpl|data-i18n-done-tpl)="[^"]*"/g, '');

// linki między podstronami: ./plik-pl.html → ./plik-w-danym-języku.html
function relinkPages(html, lang) {
  for (const p of PAGES) {
    if (p.id === 'home') continue;
    html = html.split(`href="./${p.src}`).join(`href="./${path.posix.basename(p.files[lang.code])}`);
  }
  return html;
}

function prefixPaths(html, prefix) {
  if (!prefix) return html;
  const skip = /^(#|[a-z][a-z0-9+.-]*:|\/|\.\.\/|\.\/)/i;
  html = html.replace(/\s(src|href)="([^"]+)"/g, (m, a, v) => (skip.test(v) ? m : ` ${a}="${prefix}${v}"`));
  html = html.replace(/\ssrcset="([^"]+)"/g, (m, v) =>
    ` srcset="${v.split(',').map((c) => { const s = c.trim(); return skip.test(s) ? s : prefix + s; }).join(', ')}"`);
  return html;
}

/* ---------- „Gest Dobra” w kroju i kolorach logo ----------
   W treści (nagłówki, akapity, cytaty, podpisy, przyciski, stopka) nazwa – także odmieniona, np. „Gestu Dobra” –
   jest owijana w <span class="brand-name">: zwykły tekst w kroju Bodoni Moda (opsz 18) i kolorach logo
   („gest” zielone, „dobra” brązowe). Wiersze łamią się jak w zwykłym tekście.
   Pomijane: <head>, zwykłe linki, nawigacja, okruszki, SVG i teksty ukryte. Operacja jest idempotentna. */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const CONTENT = new Set(['h1', 'h2', 'h3', 'h4', 'p', 'li', 'dt', 'dd', 'figcaption', 'blockquote']);
const SKIP_TAGS = new Set(['nav', 'svg', 'script', 'style', 'title', 'head']);
function brandify(html) {
  const start = html.indexOf('<body');
  if (start < 0) return { html, count: 0 };
  const head = html.slice(0, start);
  const parts = html.slice(start).split(/(<[^>]+>)/);
  const stack = []; let count = 0;
  for (let i = 0; i < parts.length; i++) {
    const t = parts[i];
    if (!t) continue;
    if (t[0] === '<') {
      if (t.startsWith('<!--') || t.startsWith('<!')) continue;
      const close = t.match(/^<\/([a-zA-Z0-9]+)/);
      if (close) { const n = close[1].toLowerCase(); const k = stack.map((s) => s.n).lastIndexOf(n); if (k >= 0) stack.length = k; continue; }
      const open = t.match(/^<([a-zA-Z0-9]+)/);
      if (!open) continue;
      const n = open[1].toLowerCase();
      if (VOID.has(n) || t.endsWith('/>')) continue;
      const cls = (t.match(/\sclass="([^"]*)"/) || [, ''])[1];
      stack.push({ n, cls });
      continue;
    }
    if (!/\b[Gg]est[a-ząćęłńóśźż]* [Dd]obr/.test(t)) continue;
    const inBtn = stack.some((s) => /\bbtn\b/.test(s.cls));
    const skip = stack.some((s) => SKIP_TAGS.has(s.n) || (s.n === 'a' && !/\bbtn\b/.test(s.cls)) ||
      /\b(visually-hidden|brand-name|crumbs|lang|svg-sprite)\b/.test(s.cls));
    if (skip || !(inBtn || stack.some((s) => CONTENT.has(s.n)))) continue;
    parts[i] = t.replace(/\b([Gg]est[a-ząćęłńóśźż]*) ([Dd]obr[a-ząćęłńóśźż]*)/g, (m, a, b) => {
      count++;
      return `<span class="brand-name"><span class="brand-name__g">${a}</span> <span class="brand-name__d">${b}</span></span>`;
    });
  }
  return { html: head + parts.join(''), count };
}

/* ---------- budowanie ---------- */
console.log('Gest Dobra – wersje językowe');
const PL = LANGS[0];
for (const page of PAGES) {
  let source = read(page.src);
  source = replaceBlock(source, 'head', headBlock(page, PL));
  source = replaceBlock(source, 'jsonld', jsonldBlock(page, PL, source));
  source = replaceBlock(source, 'lang', langBlock(page, PL));
  const plBrand = brandify(source); source = plBrand.html;
  console.log(`  ${page.src}: nazwa w kroju logo – nowych ${plBrand.count}`);
  write(page.src, source);

  for (const lang of LANGS.slice(1)) {
    const file = page.files[lang.code];
    let html = translateBody(source, lang);
    const missed = html.match(/\sdata-i18n(-tpl)?="[^"]*"/g);
    if (missed) throw new Error(`${lang.code}/${page.id}: nieprzetłumaczone elementy: ${missed.join(', ')}`);
    html = replaceBlock(html, 'head', headBlock(page, lang));
    html = replaceBlock(html, 'jsonld', jsonldBlock(page, lang, html));
    html = replaceBlock(html, 'lang', langBlock(page, lang));
    html = html.replace(/<html lang="[^"]*"/, `<html lang="${lang.html}"`);
    // w EL/RU nagłówki są w innym alfabecie – preload łacińskiej Brygady tylko spowalniałby pierwszy ekran
    // to samo dla łacińskiego Intera – na tych stronach łacina to tylko pojedyncze słowa (np. „Gest Dobra”)
    // (nagłówek Brygadą zawiera też łacińskie znaki – spacje, interpunkcję – więc łacińska Brygada zostaje)
    if (lang.fonts) html = html.replace(/\n\s*<link rel="preload" href="assets\/fonts\/inter-var-pl\.woff2"[^>]*>/g, '');
    html = stripMarkers(html);
    html = brandify(html).html;
    html = relinkPages(html, lang);
    html = prefixPaths(html, '../'.repeat(file.split('/').length - 1));
    html = html.replace('<!doctype html>\n', `<!doctype html>\n<!-- Plik wygenerowany automatycznie (tools/build-i18n.mjs) z ${page.src} + i18n/${lang.code}.json – nie edytuj ręcznie. -->\n`);
    write(file, html);
  }
}

// sitemap.xml z alternatywami językowymi
const today = new Date().toISOString().slice(0, 10);
const urls = [];
for (const page of PAGES) {
  const alt = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${pageUrl(page, l)}"/>`).join('\n') +
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(page, LANGS[0])}"/>`;
  for (const l of LANGS) urls.push(`  <url>\n    <loc>${pageUrl(page, l)}</loc>\n    <lastmod>${today}</lastmod>\n${alt}\n  </url>`);
}
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Plik wygenerowany przez tools/build-i18n.mjs. Domena: stała SITE w tym skrypcie. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`);
console.log('Gotowe.');
