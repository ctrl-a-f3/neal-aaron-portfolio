(() => {
  'use strict';
  const pages = ['dashboard', 'about', 'skills', 'certifications'];
  const sections = Object.fromEntries(pages.map(id => [id, document.getElementById(id)]));
  const navigation = [...document.querySelectorAll('[data-go]')];
  const wipe = document.getElementById('transitionWipe');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activePage = 'dashboard';
  let switching = false;
  let queuedPage = null;
  const getPage = () => pages.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'dashboard';

  function showPage(name) {
    activePage = name;
    pages.forEach((id, index) => {
      const active = id === name;
      const section = sections[id];
      section.classList.toggle('is-active', active);
      section.setAttribute('aria-hidden', String(!active));
      section.inert = !active;
      if (active) section.scrollTop = 0;
      document.querySelectorAll(`[data-go="${id}"]`).forEach(button => {
        button.classList.toggle('is-current', active);
        if (button.matches('.nav-btn,.mobile-tabs button')) {
          if (active) button.setAttribute('aria-current', 'page');
          else button.removeAttribute('aria-current');
        }
      });
    });
    const currentIndex = pages.indexOf(name) + 1;
    document.getElementById('footerCurrent').textContent = String(currentIndex).padStart(2, '0');
    document.getElementById('progressFill').style.width = (currentIndex / pages.length * 100) + '%';
    document.title = `${name === 'dashboard' ? 'Dashboard' : name === 'certifications' ? 'Certificates' : name.charAt(0).toUpperCase() + name.slice(1)} | Neal Aaron M. Alvarez`;
  }

  function switchPage(name, updateUrl = true) {
    if (!pages.includes(name)) name = 'dashboard';
    if (name === activePage && !switching) return;
    if (switching) { queuedPage = name; return; }
    if (updateUrl && location.hash !== '#' + name) history.pushState(null, '', '#' + name);
    switching = true;
    if (reducedMotion.matches) {
      showPage(name);
      switching = false;
      return;
    }
    wipe.classList.remove('is-running');
    void wipe.offsetWidth;
    wipe.classList.add('is-running');
    window.setTimeout(() => showPage(name), 245);
    window.setTimeout(() => {
      wipe.classList.remove('is-running');
      switching = false;
      if (queuedPage && queuedPage !== activePage) {
        const next = queuedPage;
        queuedPage = null;
        switchPage(next);
      } else queuedPage = null;
    }, 690);
  }
  navigation.forEach(button => button.addEventListener('click', () => switchPage(button.dataset.go)));
  window.addEventListener('popstate', () => switchPage(getPage(), false));
  window.addEventListener('hashchange', () => switchPage(getPage(), false));
  showPage(getPage());
  document.getElementById('year').textContent = new Date().getFullYear();

  // Paginate certificates instead of making the visitor scroll down through all six.
  const cards = [...document.querySelectorAll('.cert-card')];
  const filters = [...document.querySelectorAll('.filter')];
  const previous = document.getElementById('certPrevious');
  const next = document.getElementById('certNext');
  const pageStatus = document.getElementById('certPageStatus');
  let filter = 'all';
  let page = 0;
  function pageSize() { return window.innerWidth <= 640 ? 1 : window.innerWidth <= 840 ? 2 : 3; }
  function renderCertificates() {
    const filtered = cards.filter(card => filter === 'all' || card.dataset.category === filter);
    const size = pageSize();
    page = Math.min(page, Math.max(0, Math.ceil(filtered.length / size) - 1));
    const start = page * size;
    cards.forEach(card => {
      const index = filtered.indexOf(card);
      const visible = index >= start && index < start + size;
      card.hidden = !visible;
      card.inert = !visible;
    });
    previous.disabled = page === 0;
    next.disabled = start + size >= filtered.length;
    const first = filtered.length ? String(start + 1).padStart(2, '0') : '00';
    const last = String(Math.min(start + size, filtered.length)).padStart(2, '0');
    pageStatus.textContent = `${first}—${last} / ${String(filtered.length).padStart(2, '0')}`;
  }
  filters.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    page = 0;
    filters.forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    renderCertificates();
  }));
  previous.addEventListener('click', () => { page--; renderCertificates(); });
  next.addEventListener('click', () => { page++; renderCertificates(); });
  window.addEventListener('resize', renderCertificates);
  renderCertificates();

  // Original PDFs are included locally; accessible preview dialog with keyboard support.
  const modal = document.getElementById('certModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalCertId = document.getElementById('modalCertId');
  const modalViewer = document.getElementById('certificateViewer');
  const modalDownload = document.getElementById('modalDownload');
  const modalClose = document.getElementById('modalClose');
  let previousFocus = null;
  function openCertificate(card) {
    previousFocus = document.activeElement;
    modalTitle.textContent = card.dataset.title;
    modalCertId.textContent = 'CERT ID / ' + card.dataset.certid;
    modalDownload.href = card.dataset.pdf;
    modalDownload.download = card.dataset.pdf.split('/').pop();
    modalViewer.src = card.dataset.pdf + '#view=FitH';
    modal.inert = false;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.querySelector('.app-shell').inert = true;
    modalClose.focus();
  }
  function closeCertificate() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.inert = true;
    modalViewer.src = 'about:blank';
    document.querySelector('.app-shell').inert = false;
    if (previousFocus?.focus) previousFocus.focus();
  }
  cards.forEach(card => card.addEventListener('click', () => openCertificate(card)));
  modalClose.addEventListener('click', closeCertificate);
  modal.querySelector('[data-close-modal]').addEventListener('click', closeCertificate);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeCertificate();
    if (event.key === 'Tab' && modal.classList.contains('is-open')) {
      const items = [modalClose, modalDownload];
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[1].focus(); }
      else if (!event.shiftKey && document.activeElement === items[1]) { event.preventDefault(); items[0].focus(); }
    }
  });
})();
