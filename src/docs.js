import { docs } from './content.js';
import { initLang, currentLang } from './i18n.js';

const sectionsEl = document.querySelector('#docs-sections');
const tocEl = document.querySelector('#docs-toc');

function render(lang) {
  const sections = docs[lang] ?? docs.id;
  sectionsEl.innerHTML = sections
    .map(
      (s) => `<article class="doc" id="${s.id}">
        <h2>${s.title}</h2>
        <div class="prose">${s.html}</div>
      </article>`,
    )
    .join('');
  tocEl.innerHTML = sections
    .map((s) => `<a href="#${s.id}">${s.title}</a>`)
    .join('');
  spy();
}

// Sorot bagian yang sedang dibaca di daftar isi.
let observer;
function spy() {
  observer?.disconnect();
  const links = new Map(
    [...tocEl.querySelectorAll('a')].map((a) => [a.getAttribute('href').slice(1), a]),
  );
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const a of links.values()) a.classList.remove('is-active');
        links.get(entry.target.id)?.classList.add('is-active');
      }
    },
    { rootMargin: '-15% 0px -70% 0px' },
  );
  for (const section of sectionsEl.querySelectorAll('.doc')) observer.observe(section);
}

render(currentLang());
window.addEventListener('langchange', (e) => render(e.detail.lang));
initLang();
