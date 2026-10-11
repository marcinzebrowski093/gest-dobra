# Gest Dobra – podsumowanie projektu

Strona typu one-page wykonana na podstawie projektu z Figmy (desktop 1440 px), w czystym HTML, CSS i JavaScript, bez frameworków i bibliotek. Poniżej opis etapów, zastosowanych standardów i wyników testów oraz lista rzeczy do domknięcia przed publikacją.

---

## 1. Wyniki końcowe

| Test | Wynik |
|---|---|
| Lighthouse – mobile (emulacja 4G) | **Performance 100 · Accessibility 100 · Best Practices 100 · SEO 100** |
| Lighthouse – desktop | **100 · 100 · 100 · 100** |
| Core Web Vitals (mobile) | LCP 1,1–1,4 s · CLS 0 · TBT 0 ms (wszystkie 8 stron) |
| Core Web Vitals (desktop) | LCP 0,4 s · CLS 0 · TBT 0 ms · FCP 0,3 s |
| axe-core (WCAG 2.0/2.1/2.2 A + AA + best practices) | **0 naruszeń** – desktop, mobile z otwartym menu, dropdown języka, strona 404 |
| Walidacja HTML (html-validate) | bez błędów |
| Błędy w konsoli przeglądarki / naruszenia CSP | brak |
| Przewijanie w poziomie (360–1440 px) | brak |
| Waga strony przy pierwszym wejściu | ok. **155 KB** (ekrany Retina: ok. 250 KB, bo ładują się zdjęcia w 2×). HTML z ilustracją SVG 11 KB, CSS 7 KB, JS 2 KB po kompresji Brotli; fonty 54 KB; logo i gałązki SVG 9 KB; zdjęcia kroków 71 KB |

Testy uruchamiano na serwerze lokalnym odwzorowującym nagłówki produkcyjne z `.htaccess` (kompresja, cache, CSP).

---

## 2. Etapy prac

### Etap 1 – Analiza projektu i pomiary
- Projekt (eksport 2880 px, czyli 2× z 1440 px) pocięty na sekcje i zmierzony co do piksela: pozycje, odstępy, promienie zaokrągleń, cienie.
- Kolory odczytane bezpośrednio z pikseli projektu:
  - zieleń `#6E7500`,
  - brąz `#8C5A3C`,
  - tekst `#513523`,
  - czerwień serca `#FF4040`,
  - krem `#FFFAF0`,
  - tło `#F2E8DE`.
- Typografia skalibrowana pomiarem szerokości linii w przeglądarce i porównaniem z projektem:
  - **Inter**: Light 300 dla treści, SemiBold 600 dla tytułów, Bold 700 dla przycisków, bez dodatkowego letter-spacingu.
  - **Bodoni Moda** w rozmiarze optycznym 18 (od wersji 1.4 nagłówki są w kroju Brygada 1918, a Bodoni został tylko w numeracji 01, 02…, patrz etap 3).
- Rezultat: szerokości linii tekstu zgodne z projektem z dokładnością 1–3 px, pozycje sekcji z dokładnością 1–3 px.

### Etap 2 – Porządek i optymalizacja grafik
- Pliki uporządkowane: `assets/img`, `assets/fonts`, `css`, `js`. Oryginały z Figmy trafiły do `_design/source-assets/` (nie są publikowane).
- Nazwy plików zmienione na opisowe, np. `step-02-dostrzez`, `hero-illustration`, `leaf-left`.
- Zdjęcia kroków (oficjalne grafiki 1100 px z gestdobra.pl) w formacie **AVIF** z fallbackiem **WebP**, w dwóch rozmiarach (560 px i 1100 px). Przeglądarka sama wybiera wersję 1× albo 2× (Retina) przez `srcset`.
- Logo, ilustracja, ikona, gałązki i separator jako **SVG** z Figmy, zoptymalizowane narzędziem SVGO (−50–60% wagi, bez strat wizualnych sprawdzonych piksel po pikselu). Są idealnie ostre na każdym ekranie.
- Ilustracja hero i ikony osadzone w kodzie jako warstwy (okrąg, gałązka, dłoń, serce), dzięki czemu każdą część można animować osobno. Ikona serce + dłoń jest zdefiniowana raz i używana wielokrotnie (`<use>`).

### Etap 3 – Fonty
- Fonty hostowane **lokalnie**, bez Google Fonts. To ważne dla RODO: przeglądarka użytkownika nie łączy się z serwerami Google.
- Własny subset: łacina + polskie znaki + typograficzne cudzysłowy i myślniki, tylko potrzebne zakresy grubości (fonty zmienne).
- Z 4 plików / 205 KB zeszło do **2 plików / 55 KB**.
- `font-display: swap`, preload obu plików i fonty zastępcze o dopasowanych metrykach (`size-adjust`, `ascent-override`). Tekst nie „skacze” po doładowaniu fontu (CLS = 0).
- **Od wersji 1.4 nagłówki są w kroju Brygada 1918** (wybór klienta spośród 5 propozycji). To polski krój odtworzony na 100-lecie niepodległości z matryc dawnej Państwowej Odlewni Czcionek. Ma pełną grekę i cyrylicę, więc nagłówki wyglądają identycznie we wszystkich 4 językach (wcześniej EL i RU dostawały zastępczy Noto Serif Display). Pliki: 19 KB (łacina), 8 KB (greka), 12 KB (cyrylica).
- Numeracja 01, 02… zostaje w Bodoni Moda. Plik zawiera wyłącznie cyfry, więc waży 2,7 KB zamiast 22 KB.
- Od wersji 1.7 nagłówek podstrony brzmi „Jak działa gest dobra” („Jak działa” w Brygadzie 1918), a „gest dobra” to napis z logotypu (te same kształty liter i kolory: „gest” zielone, „dobra” brązowe), wstawiony jako SVG i wyrównany do linii bazowej tekstu. Czytniki ekranu i Google odczytują pełny tekst nagłówka. W wersjach EN, EL i RU nazwa w nagłówku też jest napisem z logo.
- Fonty greki i cyrylicy ładują się tylko na stronach, które zawierają te znaki (`unicode-range`). Na stronach EL i RU z wyprzedzeniem (preload) pobierany jest tylko font tekstu w danym alfabecie.
- Licencje OFL dołączone w `assets/fonts/`.

### Etap 4 – Struktura HTML (semantyka)
- Landmarki: `header`, `nav`, `main`, `section`, `footer`.
- Dokładnie jeden `h1` („Przyjmij dobro.”). Każda sekcja ma `h2`, karty i kroki mają `h3`, więc hierarchia nagłówków jest bez przeskoków.
- Kroki 01–03 jako lista numerowana `<ol>`, karty jako `<article>`, cytaty jako `<blockquote>`, zdjęcia jako `<figure>` + `<picture>`.
- Polska typografia:
  - twarde spacje po jednoliterowych spójnikach i przyimkach („w&nbsp;nas”, „i&nbsp;nie”), żeby nie zostawały na końcu wiersza,
  - cudzysłowy „…”,
  - półpauzy (–).

### Etap 4a – Podstrona „Jak działa Gest Dobra?” (wersja 1.3)
- Adres jak na obecnej stronie: `/chce-zrozumiec-wiecej.html` oraz `/en/how-it-works.html`, `/el/pos-leitourgei.html` i `/ru/kak-eto-rabotaet.html`, więc dotychczasowe linki działają dalej.
- Układ według projektu z Figmy, w tej samej skali i z tymi samymi komponentami co strona główna: okruszki, karta hero z ilustracją, panele, 5 kafelków „jak dobro żyje dłużej”, karty przykładów i pytań, „Najprostsza myśl”.
- **Sekcja „Dlaczego karta jest ważna?” (projekt autorski):**
  - tekst obok wachlarza dwóch kart (przód i tył) z ciepłą poświatą; po najechaniu karty się rozsuwają, a przy wejściu „rozkładają się” z jednej kupki,
  - pod spodem cytat i panorama trzech scen (wsparcie → nauka równowagi → samodzielność); tabliczkę usunąłem,
  - polskie napisy wtopione w grafikę zastąpiłem tekstem HTML pod każdą sceną. Dzięki temu są przetłumaczone na każdy język i dostępne dla czytników ekranu.
- Wszystkie grafiki z obecnej strony pobrane, zoptymalizowane do AVIF/WebP (1× i 2×), a ich oryginały zapisane w `_design/source-assets/jak-dziala/`.
- Menu „Karta” i „Pytania” oraz przyciski „Zobacz, jak działa Gest Dobra” na stronie głównej prowadzą do tej podstrony.

### Etap 5 – Style i responsywność
- Design tokens w `:root` (kolory, fonty, promienie, cienie, krzywe animacji).
- Od wersji 1.1 rozmiary tekstu są w `rem` (respektują ustawienia czcionki w przeglądarce) i skalują się płynnie przez `clamp()`. Typografia jest zmniejszona względem Figmy do standardowych rozmiarów webowych: tekst 17–20 px, nagłówki do 52 px, menu 17 px, przyciski 56 px wysokości (wcześniej 75 px).
- Progi:
  - **≥ 1680 px** (MacBook 16", monitory 24"+): szerszy kontener,
  - **≤ 1280 px**: ciaśniejsza nawigacja i karty,
  - **≤ 1099 px**: menu „hamburger”,
  - **≤ 860 px**: układ jednokolumnowy, zdjęcie nad kartą kroku, treści wyśrodkowane,
  - **≤ 560 px**: przyciski na całą szerokość, mniejsze dekoracje.
- Sprawdzone widoki: 360, 390 (telefony), 768, 1024 (tablety), 1280, 1440 (MacBook 13"), 1512 (MacBook 14") i 1728 px (MacBook 16").
- Style druku (`@media print`): bez nawigacji i dekoracji, bez cieni.

### Etap 6 – Interakcje i animacje
Wszystko w czystym JS i CSS (IntersectionObserver), bez bibliotek. Animowane są tylko `transform`, `opacity`, `clip-path` i `filter`, czyli właściwości liczone na GPU, więc animacje są płynne i nie obciążają procesora.

| Element | Efekt |
|---|---|
| Hero (przy wejściu) | karta wjeżdża, tytuł, lead i hasła pojawiają się kaskadowo |
| Ilustracja hero | okrąg „rysuje się” dookoła, dłoń wsuwa się, serce opada nad dłoń i dalej delikatnie się unosi, gałązka wyrasta od łodygi i kołysze się na wietrze |
| Ikona serce + dłoń (karty) | serce delikatnie unosi się i „oddycha” nad dłonią |
| Separator ♥ | linie rosną od serca na zewnątrz, serce (kształt z projektu) „rysuje się” linią przez animowaną maskę, a potem raz bije |
| Nagłówki sekcji | słowa pojawiają się po kolei (przesunięcie + rozmycie) |
| Karty | wjeżdżają od dołu kaskadowo; po najechaniu unoszą się, a cień rośnie |
| Kroki 01–03 | karty wjeżdżają z boku (naprzemiennie), zdjęcia odsłaniają się „kurtyną” z delikatnym zoomem |
| Cytaty | zielona belka rośnie, tekst wjeżdża |
| Gałązki | „wyrastają” od łodygi, potem stale lekko kołyszą się na wietrze, z delikatnym parallaxem przy przewijaniu |
| Nagłówek strony | po przewinięciu logo i menu zlewają się w jedną „szklaną” pigułkę |
| Nawigacja | podkreślenie rośnie przy najechaniu; aktywna sekcja podświetlana podczas przewijania (scrollspy) |
| Przyciski | wypełniony → po najechaniu przezroczysty z obrysem; obrysowany → wypełnia się zielenią, tekst biały |
| Menu mobilne | płynne rozwinięcie, pozycje wjeżdżają kaskadowo, ikona hamburgera zmienia się w „X” |

### Etap 7 – Dostępność (WCAG 2.2 AA / Europejski Akt o Dostępności)
Od 28.06.2025 w UE obowiązuje EAA (w Polsce ustawa o zapewnianiu spełniania wymagań dostępności). Strona jest zgodna z WCAG 2.2 na poziomie AA.

**ARIA i semantyka**
- Link „Przejdź do treści” (skip link): pierwszy element po naciśnięciu Tab, prowadzi do `<main>`.
- `nav` z `aria-label="Główna nawigacja"`. Link logo z `aria-label` opisującym cel.
- Hamburger:
  - `aria-expanded` i `aria-controls`,
  - ukryta etykieta zmieniająca się dynamicznie: „Otwórz menu” / „Zamknij menu”.
- Przełącznik języka:
  - `aria-expanded`, `aria-controls` i ukryty opis „Język strony: polski. Zmień język”,
  - aktywny język z `aria-current="page"`, niedostępny z `aria-disabled="true"`,
  - atrybuty `lang` i `hreflang` przy opcjach.
- Sekcje i kroki powiązane z nagłówkami przez `aria-labelledby`.
- Scrollspy ustawia `aria-current="location"` na aktywnym linku.
- Dekoracje ukryte przed czytnikami (`aria-hidden`): gałązki, separatory, druga warstwa serca, numery „01–03”. Numery mają za to tekstowy odpowiednik „Krok 1:” dla czytników.
- `role="list"` na listach bez kropek, bo Safari/VoiceOver inaczej gubi semantykę listy.
- Opisowe teksty alternatywne (`alt`) zdjęć; puste `alt` dla grafik czysto dekoracyjnych.

**Klawiatura i fokus**
- Pełna obsługa z klawiatury w logicznej kolejności fokusu.
- Wyraźny wskaźnik fokusu (`:focus-visible`, 3 px zielona obwódka).
- Klawisz **Esc** zamyka menu i dropdown języka i oddaje fokus na przycisk, który je otworzył. Kliknięcie poza menu też je zamyka.

**Percepcja**
- Kontrast tekstu sprawdzony dla każdej pary kolor/tło. Dla małego zielonego tekstu (np. „PL”, aktywny link w menu mobilnym) dodano ciemniejszy odcień `#575D00`, który daje ≥ 4,5:1.
- Cele dotykowe ≥ 24×24 px (WCAG 2.2, kryterium 2.5.8); hamburger i przełącznik języka mają 48 px.
- `prefers-reduced-motion`: użytkownicy, którzy wyłączyli animacje w systemie, widzą treść od razu, bez ruchu.
- Treść czytelna przy powiększeniu do 200% i bez przewijania w poziomie od 320 px (reflow).
- `lang="pl"` na dokumencie.

### Etap 8 – SEO
- `title` i `meta description` zoptymalizowane pod frazy „Gest Dobra”, „przyjmij dobro”, „przekaż dalej”.
- `canonical`, `meta robots` (z `max-image-preview:large`), `theme-color`.
- **Open Graph + Twitter Card**: dedykowany obrazek 1200×630 (`og-image.jpg`) wygenerowany w stylu strony.
- **Dane strukturalne JSON-LD** (schema.org): `Organization` (nazwa, logo, slogan), `WebSite`, `WebPage`.
- Prawidłowa hierarchia nagłówków, semantyczny HTML, opisowe teksty alternatywne.
- `sitemap.xml` i `robots.txt` (z odwołaniem do mapy strony; folder `_design` wykluczony).
- Przekierowania 301 w `.htaccess`: HTTP → HTTPS, `www` → bez `www`, `/index.html` → `/`.
- Strona 404 z `noindex` i poprawnym kodem HTTP 404.
- **Wersje językowe PL, EN, EL (grecki), RU** jako osobne, statyczne strony pod tymi samymi adresami co na obecnej stronie (`/`, `/en/`, `/el/`, `/ru/`). Dzięki temu dotychczasowe linki i pozycje w Google zostają. Każda wersja ma:
  - własne `title`, `description`, `canonical` i `lang`,
  - komplet znaczników `hreflang` (wraz z `x-default`), także w `sitemap.xml`,
  - własny obrazek do udostępnień (Open Graph) w danym języku,
  - przetłumaczone teksty alternatywne i etykiety dla czytników ekranu.
- Tłumaczenia to oficjalne teksty z obecnej strony gestdobra.pl. Uzupełniłem tylko nowe elementy interfejsu (np. etykiety przycisków).
- Treść nie jest tłumaczona przez JavaScript, tylko generowana jako gotowy HTML. To najlepsze podejście dla SEO i szybkości.
- Szybkość i mobile-friendly (100/100) to dziś bezpośrednie czynniki rankingowe Google (Core Web Vitals).

### Etap 9 – Wydajność (Core Web Vitals)
- AVIF/WebP, `loading="lazy"` i `decoding="async"` dla grafik poniżej pierwszego ekranu.
- `width`/`height` na każdym obrazku, czyli zero przesunięć układu (CLS = 0).
- `fetchpriority="high"` dla elementów LCP (logo, ilustracja hero) i preload fontów.
- Jeden plik CSS i jeden JS (`defer`), zero zewnętrznych zależności, zero zapytań do obcych domen.
- Animacje sterowane IntersectionObserverem zamiast nasłuchu przewijania. Jedyny listener scrolla (stan nagłówka i parallax) jest throttlowany przez `requestAnimationFrame` i pasywny.
- Kompresja Brotli/Gzip i cache na 1 rok (`immutable`) dla zasobów statycznych, wersjonowanie CSS/JS parametrem `?v=`.

- Animacje wejścia na pierwszym ekranie startują od `opacity: 0.01`, a nie od 0. Wizualnie efekt jest ten sam, ale przeglądarka od pierwszej klatki traktuje treść jako wyświetloną. Dzięki temu Largest Contentful Paint nie czeka na koniec animacji (1,1–1,4 s na telefonie przy emulacji 4G).

### Etap 10 – Bezpieczeństwo i RODO
- **Content Security Policy** bez `unsafe-inline`: jedyny skrypt inline dopuszczony hashem SHA-256. Blokuje to większość ataków XSS.
- Nagłówki:
  - `X-Content-Type-Options: nosniff`,
  - `Referrer-Policy`,
  - `Permissions-Policy` (kamera, mikrofon, geolokalizacja itd. wyłączone),
  - `X-Frame-Options: DENY` + `frame-ancestors 'none'` (ochrona przed clickjackingiem),
  - `Cross-Origin-Opener-Policy`.
- HSTS przygotowany (do włączenia po uruchomieniu HTTPS).
- Wyłączone listowanie katalogów; pliki ukryte i folder `_design` niedostępne z zewnątrz.
- **RODO**: strona nie wysyła danych do podmiotów trzecich (brak Google Fonts, CDN, analityki, osadzeń) i nie używa ciasteczek, więc **w obecnej formie nie wymaga banera cookies**.

### Etap 11 – Pliki uzupełniające nowoczesnej strony
- **Strona 404** (`404.html`) w stylu strony: komunikat, ikona, przycisk powrotu, `noindex`.
- **Favicony**:
  - `favicon.ico` (16/32 px),
  - `icon.svg` (wektorowa, ostra na każdym ekranie),
  - `apple-touch-icon.png` (180 px).
- **Web App Manifest** (`site.webmanifest`): nazwa, kolory, ikony 192/512 i ikona „maskable” dla Androida.
- **Obrazek do udostępnień** (`og-image.jpg`, 1200×630).
- `robots.txt`, `sitemap.xml`, `.htaccess`.

### Etap 12 – Testy i kontrola jakości
- Porównanie zrzutów ekranu z projektem (nakładanie, pomiary pozycji elementów w DOM).
- Testy na emulowanych urządzeniach: 360, 390 (telefony), 768, 1024 (tablety), 1280, 1440 (desktop).
- Testy interakcji: menu mobilne, dropdown języka, Esc, kliknięcie poza, hovery przycisków, kolejność fokusu, scrollspy, kotwice.
- Weryfikacja animacji klatka po klatce i kontrola, że po przewinięciu wszystkie elementy się odsłaniają.
- Audyty: Lighthouse (mobile + desktop), axe-core, html-validate, nasłuch błędów konsoli i naruszeń CSP.
- Błędy wykryte i naprawione w trakcie testów:
  - zdjęcia kroków nie odsłaniały się (specyfika IntersectionObservera z `clip-path` w Chrome),
  - prześwitujący panel menu mobilnego,
  - nachodzenie gałązek na nagłówki przy węższych ekranach,
  - nieaktualny aktywny link po skoku na górę strony,
  - graniczny kontrast małego zielonego tekstu.

---

## 3. Świadome odstępstwa od projektu
- Poprawione literówki w hero: „gest dobrato bezinteresowany” → „Gest Dobra to bezinteresowny”.
- Nagłówki „Czym naprawdę…” i „Jak przekazać…” są wyśrodkowane. W Figmie były przesunięte ok. 48 px w prawo, prawdopodobnie przez szerokość pola tekstowego.
- Przycisk w karcie „Jeden prosty gest” wyśrodkowany (w Figmie lekko w lewo).
- Odstęp nagłówek → lead w sekcji „Przykłady” ujednolicony z pozostałymi sekcjami (różnica 11 px).
- W stopce półpauza „–” zamiast dywizu „-” (polska typografia).
- Od wersji 1.1 skala całego interfejsu jest mniejsza niż w Figmie (tekst 17–20 px zamiast 24 px, nagłówki 52 px zamiast 64 px). Rozmiary 1:1 z projektu wyglądały na laptopach jak „powiększone”.
- Gałązki ustawione przy separatorach sekcji, żeby na żadnej szerokości ekranu nie nachodziły na treść.

---

## 4. Do zrobienia przed publikacją
- [ ] **Domena**: zamienić `https://example.com/` na docelowy adres (prawdopodobnie `https://gestdobra.pl/`, gdzie działa obecna strona) w `index.html` (canonical, og:url, og:image, JSON-LD), `sitemap.xml` i `robots.txt`.
- [ ] **Teksty tłumaczeń do przejrzenia przez native speakerów** (EL, RU): podpisy trzech scen w sekcji o karcie, opisy kart i kilka etykiet interfejsu to nowe tłumaczenia. Reszta pochodzi z obecnej strony.
- [ ] **Karta w wersjach EN/EL/RU**: zdjęcia karty pokazują fizyczną, polską kartę (napisy po polsku). Jeśli powstaną karty w innych językach, wystarczy podmienić pliki `assets/img/jak-dziala/karta-*.webp`.
- [ ] **Grafika „dobro z obowiązkiem / dobro z wolnością”** ma polskie napisy wpisane w obraz (tak jak na obecnej stronie). Dla pełnej lokalizacji potrzebna byłaby wersja bez napisów.
- [ ] Po uruchomieniu HTTPS: odkomentować HSTS w `.htaccess`.
- [ ] Dodać stronę do **Google Search Console** i wysłać `sitemap.xml`.
- [ ] Jeśli pojawi się analityka (np. GA4) lub osadzenia (YouTube, mapy): potrzebny baner zgód + polityka prywatności. Trzeba też dopisać domeny do CSP.
- [ ] Rozważyć stopkę z danymi organizacji / polityką prywatności / deklaracją dostępności (dla instytucji publicznych deklaracja jest obowiązkowa).
- [ ] Test na fizycznych urządzeniach (iPhone/Safari, Android/Chrome).

---

## 5. Struktura plików

```
gest dobra/
├── index.html              strona główna (PL) – źródło dla wszystkich wersji językowych
├── chce-zrozumiec-wiecej.html  podstrona „Jak działa Gest Dobra?” (PL) – źródło wersji językowych
├── en/ el/ ru/             wersje językowe (strona główna + podstrona: how-it-works, pos-leitourgei, kak-eto-rabotaet) – generowane
├── i18n/                   tłumaczenia (pl, en, el, ru) w JSON
├── tools/build-i18n.mjs    generator wersji językowych, hreflang i sitemap.xml
├── 404.html                strona błędu
├── .htaccess               HTTPS, cache, kompresja, nagłówki bezpieczeństwa
├── robots.txt, sitemap.xml SEO
├── site.webmanifest        manifest aplikacji
├── favicon.ico, icon.svg, apple-touch-icon.png
├── css/style.css           wszystkie style (z komentarzami)
├── js/main.js              interakcje i animacje (bez zależności)
├── assets/
│   ├── fonts/              Inter (tekst) + Brygada 1918 (nagłówki) w wersjach PL / EL / RU, cyfry Bodoni Moda + licencje OFL
│   └── img/                grafiki SVG/AVIF/WebP, flagi, ikony, obrazki OG dla każdego języka
├── _design/                projekt z Figmy, oryginalne SVG i zdjęcia (nie publikować)
├── README.md               instrukcja techniczna
└── PODSUMOWANIE-PROJEKTU.md
```

---

## 6. Historia zmian

| Wersja | Data | Zmiany |
|---|---|---|
| 1.0 | 10.10.2026 | Pierwsza wersja: wdrożenie projektu z Figmy, animacje, dostępność, SEO, bezpieczeństwo, strona 404, podgląd na GitHub Pages |
| 1.1 | 10.10.2026 | Mniejsza, standardowa skala typografii i elementów (po przeglądzie na MacBooku 16"); rozmiary w `rem` + `clamp()`; dopracowana responsywność na wszystkich progach; grafiki wektorowe SVG z Figmy z animacjami warstw; oficjalne zdjęcia kroków w 1× i 2×; usunięte stare pliki rastrowe |
| 1.1.1 | 10.10.2026 | Wszystkie unoszące się serca (hero i ikony) poruszają się w tej samej fazie – wspólny rytm w CSS + wyrównanie startu animacji w JS |
| 1.1.2 | 10.10.2026 | Większe logo (desktop 200 px, tablet 170 px, telefon 144 px); poprawiony nagłówek na najmniejszych telefonach (320–374 px – wcześniej hamburger wychodził poza ekran przy 320 px) |
| 1.2.0 | 10.10.2026 | Wersje językowe EN, EL (grecki) i RU z oficjalnymi tłumaczeniami (adresy jak na obecnej stronie); przełącznik języka z flagami (siatka 2×2); hreflang i sitemap z alternatywami; obrazki OG w każdym języku; fonty dla greki i cyrylicy ładowane tylko na tych wersjach |
| 1.3.0 | 10.10.2026 | Podstrona „Jak działa Gest Dobra?” w 4 językach (adresy jak na obecnej stronie): okruszki, sekcje „Dlaczego powstał”, „W jaki sposób dobro może żyć dłużej” (5 kroków), „Dlaczego karta jest ważna” (autorski układ: wachlarz kart z poświatą, panorama trzech scen z podpisami w HTML zamiast tabliczki i napisów w obrazie), „Co naprawdę przekazujemy”, pytania i „Najprostsza myśl”; dane strukturalne BreadcrumbList + FAQPage; menu „Karta” i „Pytania” oraz przyciski „Zobacz, jak działa” prowadzą do podstrony; generator obsługuje wiele stron |
| 1.4.0 | 10.10.2026 | Nagłówki w kroju Brygada 1918 we wszystkich językach (wybór spośród 5 propozycji pokazanych na stronie porównawczej z podglądem na żywo); numeracja 01, 02… w cyfrach Bodoni Moda (plik 2,7 KB); usunięte fonty zastępcze greki i cyrylicy; animacje wejścia startują od opacity 0.01, więc LCP spadł do 1,1–1,4 s na telefonie |
| 1.5.0 | 11.10.2026 | Podstrona: „Gest Dobra?” w nagłówku w oryginalnym Bodoni Moda 18; ikony 5 kroków z przezroczystym tłem (bez białych kwadratów, poświaty zachowane); grafika z sercami przycięta tak, by wypełniała całe pole bez wyblakłych brzegów; sekcja „Dlaczego Gest Dobra nie wymaga rewanżu?” z większymi odstępami (więcej oddechu) |
| 1.6.0 | 11.10.2026 | Sekcja „Otrzymałeś Gest Dobra.”: zamiast małej ikony dłoni z sercem (powtarzała ilustrację hero) karta Gestu Dobra – tył z kodem QR i napisem „Zeskanuj i zobacz, co właśnie otrzymałeś” na wierzchu, przód za nim (to, co odbiorca trzyma w ręku); układ tekst + karta; wyrównane odstępy (równe marginesy wewnętrzne i zewnętrzne na każdym ekranie, przycisk wyrównany do tekstu) |
| 1.6.1 | 11.10.2026 | Flaga UK w przełączniku języka przerysowana w proporcjach 3:2 – wypełnia pole jak pozostałe flagi (wcześniej 2:1 z pustymi paskami) |
| 1.6.3 | 11.10.2026 | Przywrócone poprzednie położenie gałązek (zmiana 1.6.2 cofnięta – po mocniejszym schowaniu gałązki wyglądały jak bez łodygi). Docelowo: nowa grafika gałązek z dłuższą łodygą wychodzącą poza krawędź pliku |
| 1.7.0 | 11.10.2026 | Nagłówek podstrony „Jak działa gest dobra”: „gest dobra” jako napis z logotypu (kształty i kolory logo), we wszystkich językach; usunięty niepotrzebny już plik liter Bodoni |
| 1.7.1 | 11.10.2026 | Większy odstęp przed napisem „gest dobra” w nagłówku podstrony: w tej samej linii (margines po tekście) i po złamaniu linii (oddech od linii wyżej), bez wcięcia na początku nowej linii |
| 1.7.2 | 11.10.2026 | „Jak działa” w nagłówku podstrony w kroju Brygada 1918 (jak pozostałe nagłówki), we wszystkich językach; na podstronach EL/RU wcześniejsze pobieranie fontów nagłówka (greka/cyrylica i łacina), dzięki czemu nagłówek nie przeskakuje przy ładowaniu (CLS 0,001) |
| 1.7.3 | 11.10.2026 | „Przyjmij dobro.” (nagłówek strony głównej) w kroju Brygada 1918, we wszystkich językach; na stronach głównych EL/RU wcześniejsze pobieranie fontów nagłówka (bez przeskoku układu) |
| 1.8.0 | 11.10.2026 | Nazwa „Gest Dobra” w treści wszystkich stron i języków jako napis z logotypu (kształty i kolory logo): nagłówki, wstępy, akapity, cytaty, etykiety kart, stopka. Pomijane przyciski, menu, okruszki i meta tagi. Napis zdefiniowany raz w SVG (`<symbol>`) i wielokrotnie użyty; tekst zostaje dla czytników ekranu i Google |
| 1.8.1 | 11.10.2026 | Odmiana „Gestu Dobra” w krojem Bodoni Moda dobranym do napisu z logo (rozmiar optyczny 96, rozstaw jak w logo, kolory logo), np. „Przykłady gestu dobra”; napis z logo także na przyciskach „Zobacz, jak działa gest dobra” – po najechaniu zmienia kolor na biały razem z przyciskiem; kolory napisu ustawiane klasami CSS (zgodnie z CSP) |

## 7. Czas realizacji
- Wersja 1.0: 10.10.2026, 15:21–16:08, **ok. 47 minut**, wszystkie etapy łącznie z testami i dokumentacją.
- Publikacja na GitHub Pages i wersja 1.1 (skala, responsywność, SVG, nowe zdjęcia): 16:10–16:46, **ok. 36 minut**.
- Audyt obecnej strony, PDF dla klienta, synchronizacja serc (1.1.1): 16:46–16:58.
- Łącznie (15:21–16:58) **ok. 1 h 40 min**.
