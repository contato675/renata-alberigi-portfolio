/* Progressive enhancement: every project link works without JavaScript. */
const dialogs = new Map([...document.querySelectorAll('dialog[data-project]')].map((el) => [el.dataset.project, el]));
let active = null;
let trigger = null;
let ownsHistoryEntry = false;
const rails = new Map();
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function closeCurrent() {
  const previous = active;
  active = null;
  if (previous?.open) previous.close();
  document.documentElement.classList.remove('viewer-open');
  trigger?.focus({preventScroll:true});
  trigger = null;
}
function show(dialog, anchor) {
  if (active === dialog) return;
  closeCurrent();
  trigger = anchor ?? document.querySelector(`[data-open-project="${dialog.dataset.project}"]`);
  active = dialog;
  dialog.showModal();
  document.documentElement.classList.add('viewer-open');
  dialog.querySelector('[data-close]')?.focus();
  const start=Number(anchor?.dataset.start);
  rails.get(dialog)?.go(Number.isSafeInteger(start)&&start>=0?start:Number(dialog.dataset.cover), false);
}
function requestClose() {
  if (ownsHistoryEntry) { ownsHistoryEntry = false; history.back(); }
  else {
    history.replaceState(null, '', location.pathname + location.search);
    closeCurrent();
  }
}
function syncHistory() {
  const id = location.hash.startsWith('#project-') ? location.hash.slice(9) : '';
  const dialog = dialogs.get(id);
  if (dialog) show(dialog);
  else closeCurrent();
  ownsHistoryEntry = false;
}
for (const dialog of dialogs.values()) {
  const rail = dialog.querySelector('.image-rail');
  const slides = [...rail.querySelectorAll('figure')];
  const prev = dialog.querySelector('[data-prev]');
  const next = dialog.querySelector('[data-next]');
  const output = dialog.querySelector('output');
  let index = Number(dialog.dataset.cover);
  let scheduled = false;
  function update() {
    index = Math.max(0, Math.min(slides.length - 1, Math.round(rail.scrollLeft / Math.max(1, rail.clientWidth))));
    output.textContent = `${index + 1} ${output.dataset.of} ${slides.length}`;
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== index)));
  }
  function go(target, animated = true) {
    index = Math.max(0, Math.min(slides.length - 1, target));
    rail.scrollTo({left:index * rail.clientWidth, behavior:animated && !reduceMotion() ? 'smooth' : 'instant'});
    if (!animated || reduceMotion()) update();
  }
  rails.set(dialog, {go});
  rail.addEventListener('scroll', () => {
    if (!scheduled) requestAnimationFrame(() => {scheduled = false; update();});
    scheduled = true;
  }, {passive:true});
  new ResizeObserver(() => {if (dialog.open) go(index,false);}).observe(rail);
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  dialog.querySelector('[data-close]').addEventListener('click', requestClose);
  dialog.addEventListener('cancel', (event) => {event.preventDefault();requestClose();});
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      const items = [...dialog.querySelectorAll('a[href],button:not(:disabled),[tabindex="0"]')].filter((item) => item.getClientRects().length > 0 && !item.closest('[hidden],[aria-hidden="true"]'));
      const first = items[0], last = items.at(-1);
      if (!first) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable) return;
    if (event.key === 'ArrowRight') {event.preventDefault();go(index + 1);}
    if (event.key === 'ArrowLeft') {event.preventDefault();go(index - 1);}
  });
}
for (const anchor of document.querySelectorAll('[data-open-project]')) {
  anchor.addEventListener('click', (event) => {
    const dialog = dialogs.get(anchor.dataset.openProject);
    if (!dialog?.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    show(dialog, anchor);
    history.pushState(null, '', `#project-${dialog.dataset.project}`);
    ownsHistoryEntry = true;
  });
}
window.addEventListener('popstate', syncHistory);
syncHistory();
for (const link of document.querySelectorAll('[data-locale-link]')) {
  link.addEventListener('click', () => {
    if (location.hash && !location.hash.startsWith('#project-')) link.hash = location.hash;
  });
}
for (const button of document.querySelectorAll('[data-video]')) {
  button.hidden = false;
  button.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = button.dataset.video;
    iframe.title = button.dataset.title;
    iframe.className = 'video-frame';
    iframe.allow = 'encrypted-media; fullscreen; picture-in-picture';
    iframe.tabIndex = 0;
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    button.parentElement.replaceWith(iframe);
    iframe.focus();
  }, {once:true});
}
