/* ============================================================
   SETTINGS.JS — The Great Pixels War
   Handles: settings modal content, all settings panels,
   display/sound/notification/account/privacy settings,
   persistence to localStorage, live preview of changes
   Depends on: toast.js, modals.js
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   SETTINGS PANELS CONFIG
───────────────────────────────────────── */
const SETTINGS_PANELS = [
  { id:'display',       icon:'🖥',  label:'DISPLAY'       },
  { id:'sound',         icon:'🔊',  label:'SOUND'         },
  { id:'notifications', icon:'🔔',  label:'ALERTS'        },
  { id:'account',       icon:'👤',  label:'ACCOUNT'       },
  { id:'privacy',       icon:'🔒',  label:'PRIVACY'       }
];


/* ─────────────────────────────────────────
   BUILD SETTINGS MODAL
───────────────────────────────────────── */
function buildSettingsModal(defaultPanel = 'display') {
  const bodyEl = document.getElementById('modal-settings-body');
  if (!bodyEl) return;

  bodyEl.innerHTML = `
    <div class="settings-layout">

      <!-- Sidebar nav -->
      <nav class="settings-nav" aria-label="Settings sections">
        ${SETTINGS_PANELS.map(p => `
          <button
            class="settings-nav__item ${p.id === defaultPanel ? 'active' : ''}"
            id="settings-nav-${p.id}"
            onclick="switchSettingsPanel('${p.id}')"
            aria-selected="${p.id === defaultPanel}"
          >
            <span class="settings-nav__icon">${p.icon}</span>
            ${p.label}
          </button>
        `).join('')}
      </nav>

      <!-- Panel content -->
      <div id="settings-panels">
        ${buildDisplayPanel()}
        ${buildSoundPanel()}
        ${buildNotificationsPanel()}
        ${buildAccountPanel()}
        ${buildPrivacyPanel()}
      </div>

    </div>
  `;

  // Activate default panel
  switchSettingsPanel(defaultPanel, false);
}


/* ─────────────────────────────────────────
   SWITCH PANEL
───────────────────────────────────────── */
function switchSettingsPanel(panelId, save = false) {
  // Nav items
  document.querySelectorAll('.settings-nav__item').forEach(item => {
    const active = item.id === 'settings-nav-' + panelId;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', active);
  });

  // Panels
  document.querySelectorAll('.settings-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === 'settings-panel-' + panelId);
  });
}

window.switchSettingsPanel = switchSettingsPanel;


/* ─────────────────────────────────────────
   PANEL: DISPLAY
───────────────────────────────────────── */
function buildDisplayPanel() {
  const s = window.GPW.settings;
  return `
    <div class="settings-panel" id="settings-panel-display">
      <div class="section-title" style="margin-bottom:var(--space-5)">DISPLAY</div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">CRT SCANLINES</div>
          <div class="settings-row__desc">Retro scanline overlay on all pages</div>
        </div>
        <div class="settings-row__control">
          <div class="toggle ${s.scanlines ? 'on' : ''}"
            id="toggle-scanlines"
            onclick="toggleSetting('scanlines', this)"
            role="switch"
            aria-checked="${s.scanlines}"
            tabindex="0"
          ></div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">PIXEL FONT SIZE</div>
          <div class="settings-row__desc">Size of heading and label text</div>
        </div>
        <div class="settings-row__control">
          <select class="form-select form-select--sm" id="setting-fontScale"
            onchange="saveSetting('fontScale', this.value)"
            style="width:120px">
            <option value="small"  ${s.fontScale==='small'  ? 'selected':''}>Small</option>
            <option value="normal" ${!s.fontScale || s.fontScale==='normal' ? 'selected':''}>Normal</option>
            <option value="large"  ${s.fontScale==='large'  ? 'selected':''}>Large</option>
          </select>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">PAGE ANIMATIONS</div>
          <div class="settings-row__desc">Fade and slide animations when navigating</div>
        </div>
        <div class="settings-row__control">
          <div class="toggle ${s.animations !== false ? 'on' : ''}"
            id="toggle-animations"
            onclick="toggleSetting('animations', this)"
            role="switch"
            aria-checked="${s.animations !== false}"
            tabindex="0"
          ></div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">SHOW FPS COUNTER</div>
          <div class="settings-row__desc">Display frame rate in the corner</div>
        </div>
        <div class="settings-row__control">
          <div class="toggle ${s.showFps ? 'on' : ''}"
            id="toggle-showFps"
            onclick="toggleSetting('showFps', this)"
            role="switch"
            aria-checked="${s.showFps || false}"
            tabindex="0"
          ></div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">MAP GRID OVERLAY</div>
          <div class="settings-row__desc">Show tile grid lines on the game map</div>
        </div>
        <div class="settings-row__control">
          <div class="toggle ${s.mapGrid !== false ? 'on' : ''}"
            id="toggle-mapGrid"
            onclick="toggleSetting('mapGrid', this)"
            role="switch"
            aria-checked="${s.mapGrid !== false}"
            tabindex="0"
          ></div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">UNIT HEALTH BARS</div>
          <div class="settings-row__desc">Always show unit health on the map</div>
        </div>
        <div class="settings-row__control">
          <div class="toggle ${s.healthBars !== false ? 'on' : ''}"
            id="toggle-healthBars"
            onclick="toggleSetting('healthBars', this)"
            role="switch"
            aria-checked="${s.healthBars !== false}"
            tabindex="0"
          ></div>
        </div>
      </div>

    </div>`;
}


/* ─────────────────────────────────────────
   PANEL: SOUND
───────────────────────────────────────── */
function buildSoundPanel() {
  const s = window.GPW.settings;
  return `
    <div class="settings-panel" id="settings-panel-sound">
      <div class="section-title" style="margin-bottom:var(--space-5)">SOUND</div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">MASTER SOUND</div>
          <div class="settings-row__desc">Enable or disable all audio</div>
        </div>
        <div class="settings-row__control">
          <div class="toggle ${s.soundEnabled ? 'on' : ''}"
            id="toggle-soundEnabled"
            onclick="toggleSetting('soundEnabled', this)"
            role="switch"
            aria-checked="${s.soundEnabled}"
            tabindex="0"
          ></div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">MUSIC VOLUME</div>
          <div class="settings-row__desc">Background music and ambient tracks</div>
        </div>
        <div class="settings-row__control">
          <div class="volume-wrap">
            <span class="volume-icon">🎵</span>
            <input class="form-range" type="range" min="0" max="100"
              value="${s.musicVolume ?? 60}"
              id="setting-musicVolume"
              oninput="updateVolume('musicVolume', this.value)">
            <span class="volume-value" id="vol-music">${s.musicVolume ?? 60}</span>
          </div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">SFX VOLUME</div>
          <div class="settings-row__desc">Battle sounds, notifications, UI clicks</div>
        </div>
        <div class="settings-row__control">
          <div class="volume-wrap">
            <span class="volume-icon">💥</span>
            <input class="form-range" type="range" min="0" max="100"
              value="${s.sfxVolume ?? 80}"
              id="setting-sfxVolume"
              oninput="updateVolume('sfxVolume', this.value)">
            <span class="volume-value" id="vol-sfx">${s.sfxVolume ?? 80}</span>
          </div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">CHAT SOUNDS</div>
          <div class="settings-row__desc">Sound when new chat messages arrive</div>
        </div>
        <div class="settings-row__control">
          <div class="toggle ${s.chatSounds !== false ? 'on' : ''}"
            id="toggle-chatSounds"
            onclick="toggleSetting('chatSounds', this)"
            role="switch"
            aria-checked="${s.chatSounds !== false}"
            tabindex="0"
          ></div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">TURN ALERT SOUND</div>
          <div class="settings-row__desc">Plays when your turn begins</div>
        </div>
        <div class="settings-row__control">
          <div class="toggle ${s.turnSound !== false ? 'on' : ''}"
            id="toggle-turnSound"
            onclick="toggleSetting('turnSound', this)"
            role="switch"
            aria-checked="${s.turnSound !== false}"
            tabindex="0"
          ></div>
        </div>
      </div>

    </div>`;
}


/* ─────────────────────────────────────────
   PANEL: NOTIFICATIONS
───────────────────────────────────────── */
function buildNotificationsPanel() {
  const n = window.GPW.settings.notifications || {};
  return `
    <div class="settings-panel" id="settings-panel-notifications">
      <div class="section-title" style="margin-bottom:var(--space-5)">NOTIFICATIONS</div>

      ${[
        { key:'turns',    label:'TURN REMINDERS',      desc:'Alert when your turn starts in any game' },
        { key:'bids',     label:'BID UPDATES',         desc:'When your bid is outbid or won' },
        { key:'alliance', label:'ALLIANCE ACTIVITY',   desc:'Alliance invites, diplomacy, war declarations' },
        { key:'system',   label:'SYSTEM ANNOUNCEMENTS',desc:'Season starts, maintenance, major events' },
        { key:'chat',     label:'CHAT MENTIONS',       desc:'When someone mentions your name in chat' },
        { key:'rewards',  label:'REWARD CLAIMS',       desc:'When season rewards or achievements unlock' }
      ].map(item => `
        <div class="settings-row">
          <div class="settings-row__info">
            <div class="settings-row__label">${item.label}</div>
            <div class="settings-row__desc">${item.desc}</div>
          </div>
          <div class="settings-row__control">
            <div class="toggle ${n[item.key] !== false ? 'on' : ''}"
              id="toggle-notif-${item.key}"
              onclick="toggleNotifSetting('${item.key}', this)"
              role="switch"
              aria-checked="${n[item.key] !== false}"
              tabindex="0"
            ></div>
          </div>
        </div>
      `).join('')}

    </div>`;
}


/* ─────────────────────────────────────────
   PANEL: ACCOUNT
───────────────────────────────────────── */
function buildAccountPanel() {
  const user = window.GPW.user || window.GPW.mockUser;
  const loggedIn = window.GPW.isLoggedIn;

  if (!loggedIn) {
    return `
      <div class="settings-panel" id="settings-panel-account">
        <div class="section-title" style="margin-bottom:var(--space-5)">ACCOUNT</div>
        <div style="text-align:center;padding:3rem 1rem">
          <div style="font-size:36px;margin-bottom:1rem">🔒</div>
          <div style="font-family:var(--font-pixel);font-size:var(--px-sm);color:var(--text-dim);margin-bottom:1.5rem">
            NOT LOGGED IN
          </div>
          <button class="btn btn--green" onclick="closeModal('settings');openModal('auth');switchAuth('login')">
            LOG IN TO ACCESS ACCOUNT SETTINGS
          </button>
        </div>
      </div>`;
  }

  return `
    <div class="settings-panel" id="settings-panel-account">
      <div class="section-title" style="margin-bottom:var(--space-5)">ACCOUNT</div>

      <!-- Current account info -->
      <div style="
        display:flex;align-items:center;gap:var(--space-4);
        padding:var(--space-4);background:var(--bg3);
        border:1px solid var(--border);margin-bottom:var(--space-5)
      ">
        <div style="
          width:48px;height:48px;background:var(--bg);
          border:2px solid var(--green);display:flex;
          align-items:center;justify-content:center;font-size:24px;flex-shrink:0
        ">${user?.avatar || '🪖'}</div>
        <div>
          <div style="font-family:var(--font-pixel);font-size:var(--px-sm);color:var(--green);margin-bottom:4px">
            ${escapeHtml(user?.username || '')}
          </div>
          <div style="font-size:var(--mono-sm);color:var(--text-dim)">${escapeHtml(user?.email || '')}</div>
          <div style="font-size:var(--mono-sm);color:var(--text-dim)">${escapeHtml(user?.rank || '')}</div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">CHANGE USERNAME</div>
        <div class="form-group">
          <label class="form-label" for="acc-username">NEW USERNAME</label>
          <input class="form-input" id="acc-username" type="text"
            placeholder="${escapeHtml(user?.username || '')}" maxlength="20">
        </div>
        <button class="btn btn--green btn--sm" onclick="saveUsername()">SAVE USERNAME</button>
      </div>

      <div class="form-section">
        <div class="form-section-title">CHANGE EMAIL</div>
        <div class="form-group">
          <label class="form-label" for="acc-email">NEW EMAIL</label>
          <input class="form-input" id="acc-email" type="email"
            placeholder="${escapeHtml(user?.email || '')}">
        </div>
        <button class="btn btn--green btn--sm" onclick="saveEmail()">SAVE EMAIL</button>
      </div>

      <div class="form-section">
        <div class="form-section-title">CHANGE PASSWORD</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="acc-current-pw">CURRENT PASSWORD</label>
            <input class="form-input" id="acc-current-pw" type="password" placeholder="••••••••">
          </div>
          <div class="form-group">
            <label class="form-label" for="acc-new-pw">NEW PASSWORD</label>
            <input class="form-input" id="acc-new-pw" type="password" placeholder="Min 8 characters">
          </div>
        </div>
        <button class="btn btn--green btn--sm" onclick="savePassword()">CHANGE PASSWORD</button>
      </div>

      <div class="form-section">
        <div class="form-section-title">PROFILE CUSTOMISATION</div>
        <div class="form-group">
          <label class="form-label">CHANGE AVATAR</label>
          <div class="option-card-group" id="accAvatarPicker" style="grid-template-columns:repeat(6,1fr)">
            ${['🪖','🦅','🐺','🐉','🔱','⚡','🎯','🛡','🗡','🏴','👁','☠'].map(emoji => `
              <div class="option-card ${emoji === (user?.avatar || '🪖') ? 'option-card--selected' : ''}"
                onclick="updateAvatar(this,'${emoji}')" data-avatar="${emoji}">
                <span class="option-card__icon" style="font-size:22px">${emoji}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="acc-title">DISPLAY TITLE</label>
          <input class="form-input" id="acc-title" type="text"
            value="${escapeHtml(user?.title || '')}"
            placeholder="Iron Veteran" maxlength="30">
          <span class="form-hint">Shown below your name on your profile</span>
        </div>
        <button class="btn btn--green btn--sm" onclick="saveProfile()">SAVE PROFILE</button>
      </div>

      <div class="form-section">
        <div class="form-section-title" style="color:var(--red)">DANGER ZONE</div>
        <div style="
          padding:var(--space-4);background:rgba(255,58,58,0.05);
          border:1px solid rgba(255,58,58,0.3)
        ">
          <div style="font-size:var(--mono-md);color:var(--text-dim);margin-bottom:var(--space-4)">
            Deleting your account is permanent and cannot be undone.
            All your progress, currencies, and cosmetics will be lost.
          </div>
          <button class="btn btn--red btn--sm" onclick="confirmDeleteAccount()">
            DELETE ACCOUNT
          </button>
        </div>
      </div>

    </div>`;
}


/* ─────────────────────────────────────────
   PANEL: PRIVACY
───────────────────────────────────────── */
function buildPrivacyPanel() {
  const p = window.GPW.settings.privacy || {};
  return `
    <div class="settings-panel" id="settings-panel-privacy">
      <div class="section-title" style="margin-bottom:var(--space-5)">PRIVACY</div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">ONLINE STATUS</div>
          <div class="settings-row__desc">Show when you are online to other players</div>
        </div>
        <div class="settings-row__control">
          <div class="toggle ${p.showOnline !== false ? 'on' : ''}"
            id="toggle-showOnline"
            onclick="togglePrivacySetting('showOnline', this)"
            role="switch" aria-checked="${p.showOnline !== false}" tabindex="0"
          ></div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">WHO CAN MESSAGE YOU</div>
          <div class="settings-row__desc">Direct messages from other players</div>
        </div>
        <div class="settings-row__control">
          <select class="form-select form-select--sm" style="width:150px"
            onchange="savePrivacySetting('allowMessages', this.value)">
            <option value="all"     ${(!p.allowMessages || p.allowMessages==='all')    ?'selected':''}>Everyone</option>
            <option value="friends" ${p.allowMessages==='friends'?'selected':''}>Alliance only</option>
            <option value="none"    ${p.allowMessages==='none'   ?'selected':''}>Nobody</option>
          </select>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">WHO CAN INVITE YOU</div>
          <div class="settings-row__desc">Game and alliance invitations</div>
        </div>
        <div class="settings-row__control">
          <select class="form-select form-select--sm" style="width:150px"
            onchange="savePrivacySetting('allowInvites', this.value)">
            <option value="all"     ${(!p.allowInvites || p.allowInvites==='all')    ?'selected':''}>Everyone</option>
            <option value="friends" ${p.allowInvites==='friends'?'selected':''}>Alliance only</option>
            <option value="none"    ${p.allowInvites==='none'   ?'selected':''}>Nobody</option>
          </select>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">SHOW PROFILE PUBLICLY</div>
          <div class="settings-row__desc">Anyone can view your stats and cosmetics</div>
        </div>
        <div class="settings-row__control">
          <div class="toggle ${p.publicProfile !== false ? 'on' : ''}"
            id="toggle-publicProfile"
            onclick="togglePrivacySetting('publicProfile', this)"
            role="switch" aria-checked="${p.publicProfile !== false}" tabindex="0"
          ></div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">SHOW IN LEADERBOARD</div>
          <div class="settings-row__desc">Appear in the public rankings</div>
        </div>
        <div class="settings-row__control">
          <div class="toggle ${p.showInLeaderboard !== false ? 'on' : ''}"
            id="toggle-showInLeaderboard"
            onclick="togglePrivacySetting('showInLeaderboard', this)"
            role="switch" aria-checked="${p.showInLeaderboard !== false}" tabindex="0"
          ></div>
        </div>
      </div>

    </div>`;
}


/* ─────────────────────────────────────────
   SETTING TOGGLES
───────────────────────────────────────── */
function toggleSetting(key, el) {
  const isOn = el.classList.toggle('on');
  el.setAttribute('aria-checked', isOn);
  window.GPW.settings[key] = isOn;
  persistSettings();
  applySettingLive(key, isOn);
  showToast(key.replace(/([A-Z])/g,' $1').toUpperCase() + ': ' + (isOn ? 'ON' : 'OFF'), 'neutral');
}

function toggleNotifSetting(key, el) {
  const isOn = el.classList.toggle('on');
  el.setAttribute('aria-checked', isOn);
  if (!window.GPW.settings.notifications) window.GPW.settings.notifications = {};
  window.GPW.settings.notifications[key] = isOn;
  persistSettings();
}

function togglePrivacySetting(key, el) {
  const isOn = el.classList.toggle('on');
  el.setAttribute('aria-checked', isOn);
  if (!window.GPW.settings.privacy) window.GPW.settings.privacy = {};
  window.GPW.settings.privacy[key] = isOn;
  persistSettings();
}

function savePrivacySetting(key, value) {
  if (!window.GPW.settings.privacy) window.GPW.settings.privacy = {};
  window.GPW.settings.privacy[key] = value;
  persistSettings();
  showToast('Privacy setting saved', 'success');
}

function saveSetting(key, value) {
  window.GPW.settings[key] = value;
  persistSettings();
  applySettingLive(key, value);
  showToast('Setting saved', 'success');
}

function updateVolume(key, value) {
  window.GPW.settings[key] = parseInt(value, 10);
  persistSettings();
  const labelId = key === 'musicVolume' ? 'vol-music' : 'vol-sfx';
  const label   = document.getElementById(labelId);
  if (label) label.textContent = value;
}

window.toggleSetting        = toggleSetting;
window.toggleNotifSetting   = toggleNotifSetting;
window.togglePrivacySetting = togglePrivacySetting;
window.savePrivacySetting   = savePrivacySetting;
window.saveSetting          = saveSetting;
window.updateVolume         = updateVolume;


/* ─────────────────────────────────────────
   LIVE SETTING APPLICATION
───────────────────────────────────────── */
function applySettingLive(key, value) {
  switch (key) {
    case 'scanlines':
      document.body.classList.toggle('no-scanlines', !value);
      break;
    case 'fontScale':
      document.documentElement.setAttribute('data-font-scale', value);
      break;
    case 'animations':
      document.body.classList.toggle('no-animations', !value);
      break;
  }
}


/* ─────────────────────────────────────────
   PERSIST SETTINGS TO LOCALSTORAGE
───────────────────────────────────────── */
function persistSettings() {
  try {
    localStorage.setItem('gpw_settings', JSON.stringify(window.GPW.settings));
  } catch(e) { /* storage unavailable */ }
}


/* ─────────────────────────────────────────
   ACCOUNT ACTIONS (mock)
───────────────────────────────────────── */
function saveUsername() {
  const input = document.getElementById('acc-username');
  const val   = input?.value.trim();
  if (!val || val.length < 3) {
    showToast('Username must be at least 3 characters', 'error');
    return;
  }
  if (window.GPW.user) window.GPW.user.username = val.toUpperCase();
  if (window.updateNavAuth) window.updateNavAuth();
  showToast('Username updated!', 'success');
}

function saveEmail() {
  const input = document.getElementById('acc-email');
  const val   = input?.value.trim();
  if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    showToast('Enter a valid email', 'error');
    return;
  }
  if (window.GPW.user) window.GPW.user.email = val;
  showToast('Email updated!', 'success');
}

function savePassword() {
  const current = document.getElementById('acc-current-pw')?.value;
  const newPw   = document.getElementById('acc-new-pw')?.value;
  const user    = window.GPW.user;

  if (!current || !newPw) { showToast('Fill in both fields', 'error'); return; }
  if (user && current !== user.password) { showToast('Current password incorrect', 'error'); return; }
  if (newPw.length < 8) { showToast('New password must be at least 8 characters', 'error'); return; }

  if (user) user.password = newPw;
  showToast('Password changed!', 'success');
}

function saveProfile() {
  const titleInput  = document.getElementById('acc-title');
  const user        = window.GPW.user;
  if (!user) return;

  if (titleInput && titleInput.value.trim()) {
    user.title = titleInput.value.trim();
  }
  if (window._accSelectedAvatar) {
    user.avatar = window._accSelectedAvatar;
    if (window.updateNavAuth) window.updateNavAuth();
  }
  showToastFull('PROFILE SAVED', 'Your changes have been applied', 'success', '✅');
}

function updateAvatar(card, emoji) {
  document.querySelectorAll('#accAvatarPicker .option-card').forEach(c => {
    c.classList.remove('option-card--selected');
  });
  card.classList.add('option-card--selected');
  window._accSelectedAvatar = emoji;
}

function confirmDeleteAccount() {
  if (confirm('Are you sure? This cannot be undone. All your data will be deleted permanently.')) {
    if (window.handleLogout) window.handleLogout();
    closeModal('settings');
    showToastFull('ACCOUNT DELETED', 'Your account has been removed.', 'error', '🗑', 6000);
  }
}

window.saveUsername         = saveUsername;
window.saveEmail            = saveEmail;
window.savePassword         = savePassword;
window.saveProfile          = saveProfile;
window.updateAvatar         = updateAvatar;
window.confirmDeleteAccount = confirmDeleteAccount;


/* ─────────────────────────────────────────
   BOOT — Build settings modal when opened
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const _origOpen = window.openModal;
  window.openModal = function(id) {
    if (id === 'settings') {
      const body = document.getElementById('modal-settings-body');
      if (body && !body.innerHTML.trim()) {
        buildSettingsModal('display');
      } else if (body) {
        // Rebuild account panel if login state changed
        buildSettingsModal('display');
      }
    }
    _origOpen(id);
  };
});
