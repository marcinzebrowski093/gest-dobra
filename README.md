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

**Cache CSS/JS.** Pliki są cache'owane na rok. Po każdej zmianie `css/style.css` lub `js/main.js` podbij wersję w `index.html` (`?v=1.0.0` → `?v=1.0.1`) i w `404.html`.

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

**Fonty.** `assets/fonts/*-var-pl.woff2` to subsety (łacina + polskie znaki) fontów zmiennych Inter (300–700) i Bodoni Moda (400–700, opsz 18). Gdyby zabrakło jakiegoś znaku, wygeneruj subset ponownie z pełnych plików Google Fonts:

```bash
pip install fonttools brotli
pyftsubset Inter.ttf --unicodes="U+0020-007E,U+00A0-00FF,U+0104-0107,U+0118-0119,U+0141-0144,U+015A-015B,U+0179-017C,U+2013-2014,U+2018-201E,U+2022,U+2026" --flavor=woff2 --output-file=inter-var-pl.woff2
```

## Wsparcie przeglądarek
Aktualne Chrome, Edge, Firefox, Safari (macOS/iOS 16+), Samsung Internet. Bez JavaScriptu cała treść jest widoczna, tylko bez animacji.
