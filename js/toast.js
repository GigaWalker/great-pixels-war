/* ============================================================
   TOAST.JS — The Great Pixels War
   ============================================================ */
'use strict';

const TOAST_CONFIG = { defaultDuration:3000, maxToasts:5, animDuration:250 };

const TOAST_ICONS = {
  success:'✅', error:'❌', warning:'⚠', info:'ℹ',
  diamond:'💎', neutral:'📢', war:'⚔', season:'🌍',
  alliance:'🤝', reward:'🎁'
};

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str || '');
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
window.escapeHtml = escapeHtml;

function showToast(message, type = 'neutral', icon = null, duration = TOAST_CONFIG.defaultDuration) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const existing = container.querySelectorAll('.toast');
  if (existing.length >= TOAST_CONFIG.maxToasts) dismissToast(existing[0]);
  const resolvedIcon = icon || TOAST_ICONS[type] || '📢';
  const toast = document.createElement('div');
  toast.className = 'toast toast--' + type;
  toast.setAttribute('role','alert');
  toast.innerHTML = `
    <span class="toast__icon">${resolvedIcon}</span>
    <div class="toast__body toast--simple">
      <span class="toast__title">${escapeHtml(message)}</span>
    </div>
    <button class="toast__close" onclick="dismissToast(this.parentElement)" aria-label="Dismiss">✕</button>
    <div class="toast__progress" style="animation-duration:${duration}ms"></div>`;
  container.appendChild(toast);
  toast._dismissTimer = setTimeout(() => dismissToast(toast), duration);
  toast.addEventListener('mouseenter', () => {
    clearTimeout(toast._dismissTimer);
    const p = toast.querySelector('.toast__progress');
    if (p) p.style.animationPlayState = 'paused';
  });
  toast.addEventListener('mouseleave', () => {
    const p = toast.querySelector('.toast__progress');
    if (p) p.style.animationPlayState = 'running';
    toast._dismissTimer = setTimeout(() => dismissToast(toast), 1500);
  });
  return toast;
}
window.showToast = showToast;

function showToastFull(title, message, type = 'neutral', icon = null, duration = TOAST_CONFIG.defaultDuration) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const existing = container.querySelectorAll('.toast');
  if (existing.length >= TOAST_CONFIG.maxToasts) dismissToast(existing[0]);
  const resolvedIcon = icon || TOAST_ICONS[type] || '📢';
  const toast = document.createElement('div');
  toast.className = 'toast toast--' + type;
  toast.setAttribute('role','alert');
  toast.innerHTML = `
    <span class="toast__icon">${resolvedIcon}</span>
    <div class="toast__body">
      <span class="toast__title">${escapeHtml(title)}</span>
      <span class="toast__message">${escapeHtml(message)}</span>
    </div>
    <button class="toast__close" onclick="dismissToast(this.parentElement)" aria-label="Dismiss">✕</button>
    <div class="toast__progress" style="animation-duration:${duration}ms"></div>`;
  container.appendChild(toast);
  toast._dismissTimer = setTimeout(() => dismissToast(toast), duration);
  toast.addEventListener('mouseenter', () => {
    clearTimeout(toast._dismissTimer);
    const p = toast.querySelector('.toast__progress');
    if (p) p.style.animationPlayState = 'paused';
  });
  toast.addEventListener('mouseleave', () => {
    const p = toast.querySelector('.toast__progress');
    if (p) p.style.animationPlayState = 'running';
    toast._dismissTimer = setTimeout(() => dismissToast(toast), 1500);
  });
  return toast;
}
window.showToastFull = showToastFull;

function showToastAction(title, message, actionLabel, actionFn, type = 'alliance', duration = 8000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const existing = container.querySelectorAll('.toast');
  if (existing.length >= TOAST_CONFIG.maxToasts) dismissToast(existing[0]);
  const icon = TOAST_ICONS[type] || '📢';
  const id   = 'toast-action-' + Date.now();
  const toast = document.createElement('div');
  toast.className = 'toast toast--' + type + ' toast--large';
  toast.id = id;
  toast.setAttribute('role','alert');
  toast.innerHTML = `
    <span class="toast__icon">${icon}</span>
    <div class="toast__body">
      <span class="toast__title">${escapeHtml(title)}</span>
      <span class="toast__message">${escapeHtml(message)}</span>
      <div class="toast__actions">
        <button class="toast__action-btn toast__action-btn--primary" onclick="handleToastAction('${id}')">${escapeHtml(actionLabel)}</button>
        <button class="toast__action-btn" onclick="dismissToast(document.getElementById('${id}'))">DISMISS</button>
      </div>
    </div>
    <div class="toast__progress" style="animation-duration:${duration}ms"></div>`;
  toast._actionFn = actionFn;
  container.appendChild(toast);
  toast._dismissTimer = setTimeout(() => dismissToast(toast), duration);
  return toast;
}
function handleToastAction(id) {
  const toast = document.getElementById(id);
  if (!toast) return;
  if (toast._actionFn) { try { toast._actionFn(); } catch(e) {} }
  dismissToast(toast);
}
window.showToastAction   = showToastAction;
window.handleToastAction = handleToastAction;

function dismissToast(toast) {
  if (!toast || toast.classList.contains('toast--exit')) return;
  clearTimeout(toast._dismissTimer);
  toast.classList.add('toast--exit');
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, TOAST_CONFIG.animDuration);
}
window.dismissToast = dismissToast;

function dismissAllToasts() {
  const c = document.getElementById('toastContainer');
  if (c) c.querySelectorAll('.toast').forEach(t => dismissToast(t));
}
window.dismissAllToasts = dismissAllToasts;

window.toast = {
  success:  (msg, d)    => showToast(msg, 'success',  null, d),
  error:    (msg, d)    => showToast(msg, 'error',    null, d),
  warning:  (msg, d)    => showToast(msg, 'warning',  null, d),
  info:     (msg, d)    => showToast(msg, 'info',     null, d),
  diamond:  (msg, d)    => showToast(msg, 'diamond',  null, d),
  war:      (msg, i, d) => showToast(msg, 'war',      i,    d),
  season:   (msg, i, d) => showToast(msg, 'season',   i,    d),
  alliance: (msg, i, d) => showToast(msg, 'alliance', i,    d),
  reward:   (msg, i, d) => showToast(msg, 'reward',   i,    d)
};
