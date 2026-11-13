import { ui } from './content.js';

const STORAGE = 'kizuna.lang';
const LANGS = ['id', 'en', 'ja'];
const valid = (l) => LANGS.includes(l);

export function applyLang(lang) {
  const dict = ui[lang];
  document.documentElement.lang = lang;

  for (const el of document.querySelectorAll('[data-i18n]')) {
    const value = dict[el.dataset.i18n];
    if (value !== undefined) el.textContent = value;
  }
  for (const el of document.querySelectorAll('[data-i18n-html]')) {
    const value = dict[el.dataset.i18nHtml];
    if (value !== undefined) el.innerHTML = value;
  }
  for (const el of document.querySelectorAll('[data-i18n-aria]')) {
    const value = dict[el.dataset.i18nAria];
    if (value !== undefined) el.setAttribute('aria-label', value);
  }
  for (const btn of document.querySelectorAll('[data-lang]')) {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
  }

  const { titleKey, descKey } = document.documentElement.dataset;
  if (titleKey && dict[titleKey]) document.title = dict[titleKey];
  const desc = document.querySelector('meta[name="description"]');
  if (desc && descKey && dict[descKey]) desc.content = dict[descKey];
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

export function currentLang() {
  const lang = document.documentElement.lang;
  return LANGS.includes(lang) ? lang : 'id';
}

export function setLang(lang, { remember = true } = {}) {
  if (!valid(lang)) return;
  if (remember) localStorage.setItem(STORAGE, lang);
  applyLang(lang);
}

export function initLang() {
  for (const btn of document.querySelectorAll('[data-lang]')) {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  }

  const fromUrl = new URLSearchParams(location.search).get('lang');
  const stored = localStorage.getItem(STORAGE);

  if (valid(fromUrl)) {
    applyLang(fromUrl);
    return;
  }
  if (valid(stored)) {
    applyLang(stored);
    return;
  }

  // Tebakan cepat dari browser, lalu dikoreksi oleh negara IP.
  const nav = (navigator.language || '').toLowerCase();
  applyLang(nav.startsWith('ja') ? 'ja' : nav.startsWith('id') ? 'id' : 'en');

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 4000);
  fetch('https://ipwho.is/?fields=country_code', {
    cache: 'no-store',
    signal: abort.signal,
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((geo) => {
      if (!geo || geo.success === false || !geo.country_code) return;
      if (localStorage.getItem(STORAGE)) return;
      const cc = geo.country_code;
      applyLang(cc === 'JP' ? 'ja' : cc === 'ID' ? 'id' : 'en');
    })
    .catch(() => {})
    .finally(() => clearTimeout(timer));
}
