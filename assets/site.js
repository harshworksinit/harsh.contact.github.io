(() => {
  'use strict';
  document.getElementById('year').textContent = new Date().getFullYear();
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  function closeMenu() {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
  }
  menu.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const cards = [...document.querySelectorAll('.photo-card')];
  const filters = [...document.querySelectorAll('.filter')];
  const status = document.getElementById('gallery-status');
  let visibleCards = cards.filter(card => card.dataset.selected === 'true');
  cards.forEach(card => { card.hidden = card.dataset.selected !== 'true'; });
  status.textContent = `${visibleCards.length} of ${cards.length} photographs · Selected`;
  const filterBar = document.querySelector('.filters');
  filterBar.hidden = false;
  filters.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    cards.forEach(card => {
      card.hidden = category === 'selected' ? card.dataset.selected !== 'true' : category !== 'all' && card.dataset.category !== category;
    });
    visibleCards = cards.filter(card => !card.hidden);
    status.textContent = `${visibleCards.length} photograph${visibleCards.length === 1 ? '' : 's'} · ${button.dataset.label}`;
  }));

  const dialog = document.getElementById('lightbox');
  if (typeof dialog.showModal !== 'function') return; // Links still open the full photographs.
  const fullImage = document.getElementById('viewer-image');
  const title = document.getElementById('viewer-title');
  const caption = document.getElementById('viewer-caption');
  const count = document.getElementById('viewer-count');
  const imageStatus = document.getElementById('viewer-status');
  const close = document.querySelector('.viewer-close');
  let activeCards = cards;
  let current = 0;
  let opener = null;
  let touchStart = null;
  const fullLink = card => card.querySelector('.photo-link');
  function renderPhoto() {
    const link = fullLink(activeCards[current]);
    const thumbnail = link.querySelector('img');
    title.textContent = link.dataset.title;
    caption.textContent = link.dataset.caption;
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(activeCards.length).padStart(2, '0')}`;
    fullImage.alt = thumbnail.alt;
    imageStatus.hidden = false;
    imageStatus.textContent = 'Loading photograph…';
    fullImage.onload = () => { imageStatus.hidden = true; };
    fullImage.onerror = () => { imageStatus.textContent = 'This photograph could not load. Please try again.'; };
    fullImage.src = link.href;
    if (fullImage.complete && fullImage.naturalWidth > 0) imageStatus.hidden = true;
  }
  function openPhoto(card, trigger, useAll = false) {
    opener = trigger;
    activeCards = useAll ? cards : visibleCards;
    current = Math.max(0, activeCards.indexOf(card));
    renderPhoto();
    dialog.showModal();
    document.body.classList.add('viewer-open');
    close.focus();
  }
  function step(direction) {
    current = (current + direction + activeCards.length) % activeCards.length;
    renderPhoto();
  }
  cards.forEach(card => fullLink(card).addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openPhoto(card, event.currentTarget);
  }));
  const heroPhoto = document.querySelector('.hero-photo > a');
  heroPhoto.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openPhoto(cards.find(card => card.id === 'photo-open-road'), heroPhoto, true);
  });
  close.addEventListener('click', () => dialog.close());
  document.querySelector('.viewer-prev').addEventListener('click', () => step(-1));
  document.querySelector('.viewer-next').addEventListener('click', () => step(1));
  dialog.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    fullImage.removeAttribute('src');
    if (opener?.isConnected) opener.focus({preventScroll: true});
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
    if (event.key === 'Home') { event.preventDefault(); current = 0; renderPhoto(); }
    if (event.key === 'End') { event.preventDefault(); current = activeCards.length - 1; renderPhoto(); }
  });
  const stage = document.querySelector('.viewer-stage');
  stage.addEventListener('click', event => { if (event.target === stage) dialog.close(); });
  stage.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? {x: event.touches[0].clientX, y: event.touches[0].clientY} : null;
  }, {passive: true});
  stage.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
    touchStart = null;
  }, {passive: true});
  stage.addEventListener('touchcancel', () => { touchStart = null; }, {passive: true});
})();
