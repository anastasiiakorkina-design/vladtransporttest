/**
 * app.js — Україна — Шотландія — Україна
 * Landing page interactivity: navigation, city search, form, modals, toasts
 */

(function () {
  'use strict';

  // ===========================
  // Data
  // ===========================
  const CITIES = [
    'Івано-Франківськ', 'Львів',
    'Фрейзербург', 'Пітерхед', 'Абердин', 'Данді', 'Сент-Ендрюс',
    'Перт', 'Стірлінг', 'Фалкірк', 'Данфермлін', 'Единбург',
    'Лівінгстон', 'Глазго', 'Геленсбург', 'Грінок', 'Кілмарнок',
    'Ейр', 'Дамфріс'
  ];

  const PHONE_UK = '+447856131016';
  const PHONE_UA = '+380969773758';
  const WA_LINK = 'https://wa.me/380969773758';

  // ===========================
  // DOM elements
  // ===========================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const burger = $('#burger');
  const nav = $('#nav');
  const citySearch = $('#city-search');
  const searchResult = $('#search-result');
  const form = $('#application-form');
  const typeSelect = $('#form-type');
  const weightGroup = $('#weight-group');
  const weightInput = $('#form-weight');
  const toast = $('#toast');
  const modalOverlay = $('#modal-overlay');
  const modalMessage = $('#modal-message');
  const modalClose = $('#modal-close');
  const modalCopyBtn = $('#modal-copy-btn');
  const modalTgLink = $('#modal-tg-link');
  const modalWaLink = $('#modal-wa-link');
  const cityAutocomplete = $('#city-autocomplete');
  const formCity = $('#form-city');

  // ===========================
  // Burger menu
  // ===========================
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', isOpen);
  });

  // Close menu on nav link click
  $$('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // ===========================
  // Smooth scroll for anchor links
  // ===========================
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const headerH = $('.header').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });

  // ===========================
  // Toast
  // ===========================
  let toastTimer = null;
  function showToast(message, duration = 3000) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // ===========================
  // Copy to clipboard helper
  // ===========================
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(ta);
      return ok;
    }
  }

  // ===========================
  // Telegram button (copies number + toast)
  // ===========================
  function handleTelegramClick() {
    copyToClipboard(PHONE_UK).then((ok) => {
      if (ok) {
        showToast('Номер скопійовано: ' + PHONE_UK + '. Відкрийте Telegram.');
      }
    });
  }

  // Bind all Telegram buttons
  ['#hero-telegram-btn', '#contact-tg-btn', '#sticky-tg-btn'].forEach((sel) => {
    const el = $(sel);
    if (el) el.addEventListener('click', handleTelegramClick);
  });

  // ===========================
  // City search (route section)
  // ===========================
  const cityTags = $$('.city-tag');

  function normalizeStr(s) {
    return s.toLowerCase().replace(/[''ʼ`]/g, "'").trim();
  }

  citySearch.addEventListener('input', () => {
    const query = normalizeStr(citySearch.value);
    let found = false;

    cityTags.forEach((tag) => {
      const cityName = normalizeStr(tag.dataset.city);
      if (query && cityName.includes(query)) {
        tag.classList.add('highlight');
        found = true;
      } else {
        tag.classList.remove('highlight');
      }
    });

    if (!query) {
      searchResult.textContent = '';
      searchResult.className = 'route__search-result';
    } else if (found) {
      searchResult.textContent = 'Так! Ми їдемо у це місто ✓';
      searchResult.className = 'route__search-result route__search-result--found';
    } else {
      searchResult.textContent = 'На жаль, цього міста немає в маршруті. Зверніться до нас — можливо, домовимось!';
      searchResult.className = 'route__search-result route__search-result--not-found';
    }
  });

  // ===========================
  // Form: show/hide weight field
  // ===========================
  typeSelect.addEventListener('change', () => {
    const isParcel = typeSelect.value === 'parcel';
    weightGroup.hidden = !isParcel;
    if (isParcel) {
      weightInput.setAttribute('required', '');
    } else {
      weightInput.removeAttribute('required');
      weightInput.value = '';
    }
  });

  // ===========================
  // Form: city autocomplete
  // ===========================
  let acIndex = -1;

  function renderAutocomplete(query) {
    const q = normalizeStr(query);
    if (!q) {
      cityAutocomplete.classList.remove('open');
      cityAutocomplete.innerHTML = '';
      acIndex = -1;
      return;
    }
    const matches = CITIES.filter((c) => normalizeStr(c).includes(q));
    if (matches.length === 0) {
      cityAutocomplete.classList.remove('open');
      cityAutocomplete.innerHTML = '';
      acIndex = -1;
      return;
    }
    cityAutocomplete.innerHTML = matches
      .map((c, i) => `<li role="option" data-index="${i}" data-city="${c}">${c}</li>`)
      .join('');
    cityAutocomplete.classList.add('open');
    acIndex = -1;
  }

  formCity.addEventListener('input', () => {
    renderAutocomplete(formCity.value);
  });

  formCity.addEventListener('keydown', (e) => {
    const items = cityAutocomplete.querySelectorAll('li');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      acIndex = Math.min(acIndex + 1, items.length - 1);
      items.forEach((li, i) => li.classList.toggle('active', i === acIndex));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      acIndex = Math.max(acIndex - 1, 0);
      items.forEach((li, i) => li.classList.toggle('active', i === acIndex));
    } else if (e.key === 'Enter' && acIndex >= 0) {
      e.preventDefault();
      formCity.value = items[acIndex].dataset.city;
      cityAutocomplete.classList.remove('open');
      cityAutocomplete.innerHTML = '';
      acIndex = -1;
    }
  });

  cityAutocomplete.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    formCity.value = li.dataset.city;
    cityAutocomplete.classList.remove('open');
    cityAutocomplete.innerHTML = '';
    acIndex = -1;
  });

  // Close autocomplete on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrap')) {
      cityAutocomplete.classList.remove('open');
    }
  });

  // ===========================
  // Form: validation & submit
  // ===========================
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset errors
    form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));

    const name = $('#form-name').value.trim();
    const phone = $('#form-phone').value.trim();
    const city = formCity.value.trim();
    const type = typeSelect.value;
    const weight = weightInput.value;
    const message = $('#form-message').value.trim();
    let valid = true;

    if (!name) { $('#form-name').classList.add('error'); valid = false; }
    if (!phone || phone.length < 8) { $('#form-phone').classList.add('error'); valid = false; }
    if (!city) { formCity.classList.add('error'); valid = false; }
    if (!type) { typeSelect.classList.add('error'); valid = false; }
    if (type === 'parcel' && (!weight || parseFloat(weight) <= 0)) {
      weightInput.classList.add('error');
      valid = false;
    }

    if (!valid) {
      showToast('Будь ласка, заповніть всі обов\'язкові поля');
      // Focus first error
      const firstErr = form.querySelector('.error');
      if (firstErr) firstErr.focus();
      return;
    }

    // Build message text
    const typeName = type === 'passenger' ? 'Пасажир' : 'Посилка';
    let msgText = `Привіт! Хочу залишити заявку:\n`;
    msgText += `Ім'я: ${name}\n`;
    msgText += `Телефон: ${phone}\n`;
    msgText += `Місто: ${city}\n`;
    msgText += `Тип: ${typeName}\n`;
    if (type === 'parcel' && weight) {
      msgText += `Вага: ${weight} кг\n`;
      const cost = Math.max(25, parseFloat(weight) * 2);
      msgText += `Орієнтовна вартість: £${cost}\n`;
    }
    if (message) {
      msgText += `Повідомлення: ${message}\n`;
    }

    // Show modal
    modalMessage.textContent = msgText;
    const encodedMsg = encodeURIComponent(msgText);
    modalWaLink.href = WA_LINK + '?text=' + encodedMsg;
    // Telegram — no username, so we just copy
    modalTgLink.href = '#';
    modalTgLink.addEventListener('click', (ev) => {
      ev.preventDefault();
      copyToClipboard(msgText).then((ok) => {
        if (ok) showToast('Повідомлення скопійовано! Вставте в Telegram.');
      });
    }, { once: true });

    modalOverlay.hidden = false;
    // Small delay for transition
    requestAnimationFrame(() => {
      modalOverlay.style.opacity = '1';
    });
  });

  // ===========================
  // Modal: copy button
  // ===========================
  modalCopyBtn.addEventListener('click', () => {
    const text = modalMessage.textContent;
    copyToClipboard(text).then((ok) => {
      if (ok) showToast('Повідомлення скопійовано!');
    });
  });

  // ===========================
  // Modal: close
  // ===========================
  function closeModal() {
    modalOverlay.style.opacity = '0';
    setTimeout(() => {
      modalOverlay.hidden = true;
    }, 300);
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
  });

  // ===========================
  // Header shrink on scroll
  // ===========================
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const header = $('#header');
    if (scrollY > 60) {
      header.style.boxShadow = '0 2px 12px rgba(0,0,0,.08)';
    } else {
      header.style.boxShadow = 'none';
    }
    lastScroll = scrollY;
  }, { passive: true });

  // ===========================
  // Tracking: Nova Poshta TTN
  // ===========================
  const trackingInput = $('#tracking-input');
  const trackingBtn = $('#tracking-btn');
  const trackingCopyBtn = $('#tracking-copy-btn');

  function getCleanTTN() {
    return trackingInput.value.replace(/\s+/g, '');
  }

  function isValidTTN(ttn) {
    return /^\d{10,20}$/.test(ttn);
  }

  trackingInput.addEventListener('input', () => {
    const ttn = getCleanTTN();
    const valid = isValidTTN(ttn);
    trackingCopyBtn.disabled = !valid;
    trackingInput.classList.toggle('error', ttn.length > 0 && !valid);
  });

  trackingBtn.addEventListener('click', () => {
    const ttn = getCleanTTN();
    if (!isValidTTN(ttn)) {
      trackingInput.classList.add('error');
      showToast('Введіть коректний номер ТТН (10–20 цифр)');
      trackingInput.focus();
      return;
    }
    trackingInput.classList.remove('error');
    window.open('https://novaposhta.ua/tracking/?cargo_number=' + encodeURIComponent(ttn), '_blank', 'noopener');
  });

  trackingCopyBtn.addEventListener('click', () => {
    const ttn = getCleanTTN();
    if (!isValidTTN(ttn)) return;
    copyToClipboard(ttn).then((ok) => {
      if (ok) showToast('ТТН скопійовано: ' + ttn);
    });
  });

  trackingInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      trackingBtn.click();
    }
  });

})();
