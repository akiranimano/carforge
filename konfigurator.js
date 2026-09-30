/* =========================================================
   CarForge — konfigurator.js
   Hanterar val, live-prisberäkning och laglig status.

   [Instruktion: Fordonsvisningen (embed-koden) läggs i elementet
   med id="preview-stage" i konfigurator.html. Om embed-lösningen
   behöver uppdateras när ett val ändras, anropa updateVehiclePreview()
   längst ner i denna fil — den är förberedd och tom, redo att fyllas i.]
   ========================================================= */

(function () {
  'use strict';

  // --- State: aktuellt val per grupp ---
  const state = {
    falgar: { value: 'standard', label: 'Standard 17"', price: 0, legal: 'ok' },
    spoiler: { value: 'none', label: 'Ingen spoiler', price: 0, legal: 'ok' },
    avgas: { value: 'standard', label: 'Standardsystem', price: 0, legal: 'ok' },
    farg: { value: 'black', label: 'Svart', price: 0, legal: 'ok' }
  };

  const LEGAL_TEXT = {
    ok: 'Alla valda delar är inom gränserna för normal registrering.',
    check: 'En eller flera delar kräver kontrollbesiktning innan bilen är lagligt godkänd.',
    no: 'En eller flera valda delar är inte tillåtna på väg utan dispens.'
  };

  const LEGAL_LABEL = {
    ok: 'Godkänd konfiguration',
    check: 'Kontrollbesiktning krävs',
    no: 'Ej tillåten kombination'
  };

  // --- DOM-referenser ---
  const summaryEls = {
    falgar: document.getElementById('summary-falgar'),
    spoiler: document.getElementById('summary-spoiler'),
    avgas: document.getElementById('summary-avgas'),
    farg: document.getElementById('summary-farg')
  };

  const priceEl = document.getElementById('summary-price');
  const legalBadge = document.getElementById('legal-badge');
  const legalText = document.getElementById('legal-text');
  const resetBtn = document.getElementById('reset-btn');
  const vehicleSelect = document.getElementById('vehicle-select');

  const priceFormatter = new Intl.NumberFormat('sv-SE');

  /**
   * Väljer en option inom en grupp: uppdaterar state, visuellt
   * markerade val (is-selected + aria-checked), och räknar om.
   */
  function selectOption(group, button) {
    const list = button.closest('[data-group]');
    if (!list) return;

    list.querySelectorAll('.option-item, .color-item').forEach(function (item) {
      item.classList.remove('is-selected');
      item.setAttribute('aria-checked', 'false');
    });

    button.classList.add('is-selected');
    button.setAttribute('aria-checked', 'true');

    const nameEl = button.querySelector('.option-item__name, .color-item__name');

    state[group] = {
      value: button.dataset.value,
      label: nameEl ? nameEl.textContent.trim() : button.dataset.value,
      price: Number(button.dataset.price) || 0,
      legal: button.dataset.legal || 'ok'
    };

    recalculate();
    updateVehiclePreview();
  }

  /**
   * Räknar om totalpris och sammanvägd laglig status, och
   * uppdaterar sammanfattningskortet i DOM.
   */
  function recalculate() {
    let total = 0;
    let worst = 'ok';
    const severity = { ok: 0, check: 1, no: 2 };

    Object.keys(state).forEach(function (group) {
      const entry = state[group];
      total += entry.price;

      if (severity[entry.legal] > severity[worst]) {
        worst = entry.legal;
      }

      if (summaryEls[group]) {
        summaryEls[group].textContent = entry.label;
      }
    });

    priceEl.textContent = priceFormatter.format(total) + ' kr';

    legalBadge.textContent = LEGAL_LABEL[worst];
    legalBadge.className = 'badge badge--' + (worst === 'ok' ? 'ok' : worst === 'check' ? 'check' : 'no');
    legalText.textContent = LEGAL_TEXT[worst];
  }

  /**
   * Nollställer alla val till grundläget (första knappen i varje grupp).
   */
  function resetAll() {
    document.querySelectorAll('[data-group]').forEach(function (list) {
      const first = list.querySelector('.option-item, .color-item');
      if (first) {
        selectOption(list.dataset.group, first);
      }
    });

    if (vehicleSelect) {
      vehicleSelect.selectedIndex = 0;
    }
  }

  // --- Event-lyssnare: klick på val ---
  document.querySelectorAll('[data-group]').forEach(function (list) {
    list.addEventListener('click', function (event) {
      const button = event.target.closest('.option-item, .color-item');
      if (!button || !list.contains(button)) return;
      selectOption(list.dataset.group, button);
    });

    // Tangentbordsnavigering inom en radiogroup (pil upp/ner/vänster/höger)
    list.addEventListener('keydown', function (event) {
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (keys.indexOf(event.key) === -1) return;

      const items = Array.from(list.querySelectorAll('.option-item, .color-item'));
      const currentIndex = items.findIndex(function (i) { return i.classList.contains('is-selected'); });
      if (currentIndex === -1) return;

      event.preventDefault();
      const dir = (event.key === 'ArrowUp' || event.key === 'ArrowLeft') ? -1 : 1;
      const nextIndex = (currentIndex + dir + items.length) % items.length;
      items[nextIndex].focus();
      selectOption(list.dataset.group, items[nextIndex]);
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', resetAll);
  }

  if (vehicleSelect) {
    vehicleSelect.addEventListener('change', updateVehiclePreview);
  }

  /**
   * [Plats för embed-integration]
   * Anropas varje gång ett val eller fordon ändras. Om fordonsvisaren
   * (embed-koden i #preview-stage) har ett eget API för att t.ex. byta
   * fälgar, spoiler, avgassystem, färg eller fordonsmodell — anropa det
   * härifrån med värdena i `state` och vehicleSelect.value.
   *
   * Exempel (fylls i när embed-koden är på plats):
   *
   *   const stage = document.getElementById('preview-stage');
   *   if (window.NamnPaEmbedAPI) {
   *     window.NamnPaEmbedAPI.setPart('falgar', state.falgar.value);
   *     window.NamnPaEmbedAPI.setPart('spoiler', state.spoiler.value);
   *     window.NamnPaEmbedAPI.setPart('avgas', state.avgas.value);
   *     window.NamnPaEmbedAPI.setColor(state.farg.value);
   *     window.NamnPaEmbedAPI.setVehicle(vehicleSelect.value);
   *   }
   */
  function updateVehiclePreview() {
    // Avsiktligt tom tills embed-koden är på plats.
  }

  // --- Initiering ---
  recalculate();
})();
