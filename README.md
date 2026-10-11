# Gest Dobra – instrukcja techniczna

Statyczna strona one-page: HTML + CSS + vanilla JS, bez build stepu i zależności. Pełny opis prac znajdziesz w `PODSUMOWANIE-PROJEKTU.md`.

## Uruchomienie lokalne

```bash
cd "gest dobra"
python3 -m http.server 8000
# http://localhost:8000
```

Strony nie otwieraj przez `file://`, bo fonty i część funkcji wymagają serwera.

## Wdrożenie
1. Zamień `https://example.com/` na docelową domenę w: `index.html` (canonical, og:url, og:image, JSON-LD), `sitemap.xml`, `robots.txt`.
2. Wgraj na serwer wszystko **poza** `_design/` (oraz opcjonalnie poza plikami `.md`).
3. `.htaccess` działa na Apache i LiteSpeed (większość polskich hostingów). Na nginx przenieś reguły do konfiguracji serwera.
4. Po potwierdzeniu, że HTTPS działa, odkomentuj nagłówek HSTS w `.htaccess`.

## Edycja

**Cache CSS/JS.** Pliki są cache'owane na rok. Po każdej zmianie `css/style.css` lub `js/main.js` podbij wersję w `index.html` (np. `?v=1.2.0` → `?v=1.2.1`) i w `404.html`, a potem uruchom `node tools/build-i18n.mjs`.

**CSP.** W `<head>` jest jeden mały skrypt inline, dopuszczony w `.htaccess` hashem SHA-256. Jeśli zmienisz jego treść, przelicz hash i podmień go w `.htaccess`:

```bash
python3 -c "import re,hashlib,base64;s=re.search(r'<script>(.*?)</script>',open('index.html').read(),re.S).group(1);print('sha256-'+base64.b64encode(hashlib.sha256(s.encode()).digest()).decode())"
```

Nowe zasoby z zewnętrznych domen (analityka, mapy, wideo) wymagają dopisania tych domen do CSP.

**Animacje przy przewijaniu.** Sterują nimi atrybuty w HTML:

| Atrybut | Efekt |
|---|---|
| `data-reveal="up"` / `"left"` / `"right"` / `"scale"` | wjazd od dołu / z lewej / z prawej / powiększenie |
| `data-reveal="wipe-left"` / `"wipe-right"` | odsłonięcie zdjęcia „kurtyną” (na `<figure>` z `<picture>`) |
| `data-reveal="divider"` / `"quote"` / `"leaf"` | separator z sercem / cytat z belką / gałązka |
| `data-split` | nagłówek pojawia się słowo po słowie |
| `data-delay=".15"` … `".6"` | opóźnienie (dostępne wartości zdefiniowane w CSS, sekcja „Animacje”) |
| `data-stagger` (na kontenerze) | kaskadowe opóźnienie dzieci |
| `data-parallax="0.05"` | lekki parallax (gałązki) |

Przy `prefers-reduced-motion` wszystkie animacje są wyłączane automatycznie.

**Grafiki.**
- Zdjęcia dodawaj jako AVIF + WebP w `<picture>` w dwóch rozmiarach (1× i 2×, `srcset` + `sizes`), zawsze z `width`/`height` i `alt`. Poniżej pierwszego ekranu dodawaj `loading="lazy"`.
- Logo, gałązki i ikona to pliki SVG w `assets/img/`. Ilustracja hero, ikona serce + dłoń i serce separatora są wklejone w `index.html` jako warstwy SVG, żeby dało się je animować. Źródłowe pliki z Figmy leżą w `_design/source-assets/svg/`.
- Każdy nowy plik SVG przepuść przez SVGO: `npx svgo plik.svg`.

**Skala.** Rozmiary tekstu to tokeny `--fs-*` w `:root` (w `rem`, płynnie przez `clamp()`). Zmiana jednego tokenu zmienia dany rozmiar w całym serwisie.

**Fonty.**
- Treść: Inter (300–700). Nagłówki: Brygada 1918 (400–700). Numeracja 01, 02…: Bodoni Moda (`bodoni-moda-cyfry.woff2` zawiera wyłącznie cyfry 0–9, token `--font-numerals`). „gest dobra” w nagłówku podstrony to napis z logotypu wstawiony jako SVG (`.brand-mark`, tryb `data-i18n-mode="logo"` w generatorze wersji językowych).
- Każdy krój ma osobne pliki dla łaciny z polskimi znakami (`*-pl`), greki (`*-el`) i cyrylicy (`*-ru`). Przeglądarka pobiera je przez `unicode-range` tylko wtedy, gdy na stronie są takie znaki.
- Grubość nagłówków ustawia token `--serif-weight` (600).
- Gdyby zabrakło jakiegoś znaku, wygeneruj subset ponownie z pełnych plików Google Fonts:

```bash
pip install fonttools brotli
pyftsubset Inter.ttf --unicodes="U+0020-007E,U+00A0-00FF,U+0104-0107,U+0118-0119,U+0141-0144,U+015A-015B,U+0179-017C,U+2013-2014,U+2018-201E,U+2022,U+2026" --flavor=woff2 --output-file=inter-var-pl.woff2
```

## Wersje językowe

Serwis ma dwie strony w czterech językach:

| Strona | PL | EN | EL | RU |
|---|---|---|---|---|
| Główna | `/` | `/en/` | `/el/` | `/ru/` |
| Jak działa Gest Dobra? | `/chce-zrozumiec-wiecej.html` | `/en/how-it-works.html` | `/el/pos-leitourgei.html` | `/ru/kak-eto-rabotaet.html` |

- Źródłem są polskie strony (`index.html`, `chce-zrozumiec-wiecej.html`) i tłumaczenia w `i18n/{pl,en,el,ru}.json` (klucze podstrony zaczynają się od `sub.`).
- Linki między stronami zapisuj jako `./chce-zrozumiec-wiecej.html#kotwica`, a generator sam podmieni nazwę pliku w każdym języku.
- Pliki `en/`, `el/` i `ru/index.html` są **generowane**, więc nie edytuj ich ręcznie.
- Po każdej zmianie treści lub układu w `index.html` albo w tłumaczeniach uruchom:

```bash
node tools/build-i18n.mjs
```

Skrypt odświeża w `index.html` sekcję `<head>` (title, opisy, canonical, hreflang, Open Graph, JSON-LD) i przełącznik języka. Generuje też wersje językowe i `sitemap.xml`. Przerywa pracę, jeśli brakuje któregoś tłumaczenia.

- **Nowy tekst do przetłumaczenia:** dodaj elementowi `data-i18n="klucz"` (dla atrybutów `data-i18n-attr="alt:klucz"`), a klucz i tłumaczenia do wszystkich plików JSON.
- **Domena:** ustaw ją w stałej `SITE` na górze `tools/build-i18n.mjs`.
- **Obrazki OG** (`assets/img/og-image-*.jpg`) są wygenerowane z tekstów hero. Przy zmianie hasła trzeba je odświeżyć.

**Nazwa „Gest Dobra” jako napis z logo.** Generator (`brandify` w `tools/build-i18n.mjs`) zamienia w treści każde „Gest Dobra” na napis z logotypu (`<symbol id="gd-wordmark">` w sprite na górze strony). Wystarczy pisać zwykły tekst „Gest Dobra” i uruchomić generator. Odmienione formy (np. „Gestu Dobra”) są zapisywane krojem Bodoni Moda dobranym do logo (`bodoni-moda-logo.woff2`, klasa `.brand-text`). Napis działa też na przyciskach (`.btn`) – po najechaniu zmienia kolor razem z przyciskiem. Zwykłe linki, menu i okruszki zostają zwykłym tekstem. Wielkość napisu ustawia zmienna `--bm-h` w CSS.

## Wsparcie przeglądarek
Aktualne Chrome, Edge, Firefox, Safari (macOS/iOS 16+), Samsung Internet. Bez JavaScriptu cała treść jest widoczna, tylko bez animacji.
