/* ==========================================================================
   Gest Dobra – interakcje i animacje (vanilla JS, bez zależności)
   ========================================================================== */
(function () {
  'use strict';

  window.__gdReady = true;

  var root = document.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var desktopNav = window.matchMedia('(min-width: 1100px)');

  /* ---------- Nagłówek: stan po przewinięciu ---------- */
  var ticking = false;
  var parallaxItems = [];

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      root.classList.toggle('is-scrolled', window.scrollY > 40);
      clearSpyAboveFirstSection();
      updateParallax();
      ticking = false;
    });
  }

  /* ---------- Menu mobilne ---------- */
  var burger = document.querySelector('[data-burger]');
  var nav = document.querySelector('[data-nav]');
  var burgerLabel = document.querySelector('[data-burger-label]');

  function setMenu(open) {
    if (!burger || !nav) return;
    burger.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (burgerLabel) burgerLabel.textContent = open ? 'Zamknij menu' : 'Otwórz menu';
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    desktopNav.addEventListener('change', function () {
      setMenu(false);
    });
  }

  /* ---------- Przełącznik języka ---------- */
  var lang = document.querySelector('[data-lang]');
  var langToggle = document.querySelector('[data-lang-toggle]');
  var langMenu = lang ? lang.querySelector('.lang__menu') : null;

  function setLang(open) {
    if (!langToggle || !langMenu) return;
    langToggle.setAttribute('aria-expanded', String(open));
    langMenu.hidden = !open;
  }

  if (langToggle && langMenu) {
    langToggle.addEventListener('click', function () {
      setLang(langMenu.hidden);
    });
  }

  /* zamykanie po kliknięciu poza i klawiszem Esc */
  document.addEventListener('click', function (e) {
    if (lang && !lang.contains(e.target)) setLang(false);
    if (nav && burger && nav.classList.contains('is-open') && !nav.contains(e.target) && !burger.contains(e.target)) {
      setMenu(false);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (langMenu && !langMenu.hidden) {
      setLang(false);
      langToggle.focus();
    }
    if (nav && nav.classList.contains('is-open')) {
      setMenu(false);
      burger.focus();
    }
  });

  /* ---------- Podział nagłówków na słowa ---------- */
  function splitWords(el) {
    var index = 0;

    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
            } else {
              var span = document.createElement('span');
              span.className = 'word';
              span.style.setProperty('--i', index++);
              span.textContent = part;
              frag.appendChild(span);
            }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    }

    walk(el);
  }

  document.querySelectorAll('[data-split]').forEach(splitWords);

  /* ---------- Opóźnienia kaskadowe w siatkach ---------- */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      if (!child.hasAttribute('data-delay')) {
        child.style.setProperty('--d', (i % 2) * 0.14 + 's');
      }
    });
  });

  /* ---------- Animacje przy przewijaniu ---------- */
  var revealEls = document.querySelectorAll('[data-reveal], [data-split]');

  function revealAll() {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  reducedMotion.addEventListener('change', function (e) {
    if (e.matches) revealAll();
    updateParallax();
  });

  /* ---------- Aktywny link w nawigacji ---------- */
  var navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  var linkById = {};
  var spySections = [];

  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var section = id && document.getElementById(id);
    if (section) {
      linkById[id] = link;
      spySections.push(section);
    }
  });

  if (spySections.length && 'IntersectionObserver' in window) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkById[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) {
            l.classList.remove('is-active');
            l.removeAttribute('aria-current');
          });
          link.classList.add('is-active');
          link.setAttribute('aria-current', 'location');
        } else if (link.classList.contains('is-active') && entry.boundingClientRect.top > 0) {
          link.classList.remove('is-active');
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    spySections.forEach(function (s) {
      spyObserver.observe(s);
    });
  }

  /* nad pierwszą śledzoną sekcją (np. po skoku na górę strony) żaden link nie jest aktywny */
  function clearSpyAboveFirstSection() {
    if (!spySections.length) return;
    if (spySections[0].getBoundingClientRect().top > window.innerHeight * 0.55) {
      navLinks.forEach(function (l) {
        l.classList.remove('is-active');
        l.removeAttribute('aria-current');
      });
    }
  }

  /* ---------- Delikatny parallax gałązek ---------- */
  parallaxItems = Array.prototype.map.call(document.querySelectorAll('[data-parallax]'), function (el) {
    return { el: el, speed: parseFloat(el.getAttribute('data-parallax')) || 0.05 };
  });

  function updateParallax() {
    if (!parallaxItems.length) return;
    var vh = window.innerHeight;
    var off = reducedMotion.matches;
    parallaxItems.forEach(function (item) {
      if (off) {
        item.el.style.translate = '';
        return;
      }
      // pozycja liczona od sekcji-rodzica (bez własnego przesunięcia – brak sprzężenia zwrotnego)
      var rect = item.el.parentElement.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      var delta = (rect.top + Math.min(rect.height, vh) / 2 - vh / 2) * -item.speed;
      item.el.style.translate = '0 ' + delta.toFixed(1) + 'px';
    });
  }

  /* ---------- Serca unoszą się zawsze w tej samej fazie ----------
     CSS nadaje im ten sam czas i opóźnienie; tu dodatkowo wyrównujemy start
     wszystkich animacji co do milisekundy (Web Animations API). */
  function syncHearts() {
    if (!document.getAnimations) return;
    var floats = document.getAnimations().filter(function (a) {
      return a.animationName === 'heart-float' || a.animationName === 'heart-float-sm';
    });
    if (floats.length < 2 || floats[0].startTime == null) return;
    var start = floats[0].startTime;
    floats.forEach(function (a) {
      if (a.startTime !== start) a.startTime = start;
    });
  }

  window.addEventListener('load', function () {
    window.requestAnimationFrame(syncHearts);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();
