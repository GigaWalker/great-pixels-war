/* ============================================================
   NAVBAR.JS — The Great Pixels War
   Handles: navbar mount, auth UI state, active link sync,
   avatar dropdown, mobile menu, notif panel toggle,
   chat overlay toggle, season countdown pill
   Depends on: toast.js, modals.js, router.js
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   MOUNT NAVBAR HTML
───────────────────────────────────────── */
async function mountNavbar() {
  const mount = document.getElementById('navbar-mount');
  if (!mount) return;

  try {
    const res  = await fetch('components/navbar.html');
    const html = await res.text();
    mount.innerHTML = html;
  } catch (e) {
    // Fallback: inline minimal navbar if fetch fails
    mount.innerHTML = `
      <nav class="navbar" id="navbar">
        <div class="navbar__left">
          <button class="navbar__logo" onclick="navigate('home')">
            <span class="navbar__logo-the">THE</span>
            <span class="navbar__logo-main">GREAT PIXELS <span class="navbar__logo-war">WAR</span></span>
          </button>
        </div>
        <div class="navbar__right">
          <div class="navbar__auth" id="navAuth">
            <button class="btn btn--ghost btn--sm" onclick="openModal('auth'); switchAuth('login')">LOG IN</button>
            <button class="btn btn--green btn--sm" onclick="openModal('auth'); switchAuth('register')">JOIN WAR</button>
          </div>
          <button class="btn-hamburger" id="hamburgerBtn" onclick="toggleMobileMenu()">
            <span class="btn-hamburger__line"></span>
            <span class="btn-hamburger__line"></span>
            <span class="btn-hamburger__line"></span>
          </button>
        </div>
      </nav>`;
  }

  // After mounting, initialise all navbar features
  initNavbar();
}


/* ─────────────────────────────────────────
   INIT — called after HTML is mounted
───────────────────────────────────────── */
function initNavbar() {
  updateNavAuth();
  updateNavActiveLink(window.GPW.currentPage);
  startSeasonCountdown();
  renderNotifications(window.GPW.notifTab);
  updateNotifBadge();
  updateChatBadge();
}


/* ─────────────────────────────────────────
   AUTH STATE — toggle logged in / out UI
───────────────────────────────────────── */
function updateNavAuth() {
  const auth        = document.getElementById('navAuth');
  const avatarWrap  = document.getElementById('navAvatarWrap');
  const icons       = document.getElementById('navIcons');
  const dropName    = document.getElementById('dropdownName');
  const dropRank    = document.getElementById('dropdownRank');
  const dropAvatar  = document.getElementById('dropdownAvatar');

  if (window.GPW.isLoggedIn && window.GPW.user) {
    const u = window.GPW.user;

    // Show avatar, hide auth buttons
    if (auth)       auth.style.display       = 'none';
    if (avatarWrap) avatarWrap.style.display  = 'flex';
    if (icons)      icons.style.display       = 'flex';

    // Populate avatar button
    const nameEl  = document.getElementById('navAvatarName');
    const rankEl  = document.getElementById('navAvatarRank');
    const iconEl  = document.getElementById('navAvatarIcon');
    const vipEl   = document.getElementById('navVipBadge');

    if (nameEl)  nameEl.textContent  = u.username;
    if (rankEl)  rankEl.textContent  = u.rank;
    if (iconEl)  iconEl.textContent  = u.avatar;

    // VIP badge
    if (vipEl) {
      if (u.vip === 'diamond') {
        vipEl.textContent    = '💎';
        vipEl.style.display  = 'block';
        if (nameEl) nameEl.classList.add('vip-diamond');
      } else if (u.vip === 'gold') {
        vipEl.textContent    = '👑';
        vipEl.style.display  = 'block';
        if (nameEl) nameEl.classList.add('vip-gold');
      } else {
        vipEl.style.display  = 'none';
      }
    }

    // Populate dropdown
    if (dropName)   dropName.textContent   = u.username;
    if (dropRank)   dropRank.textContent   = u.rank;
    if (dropAvatar) dropAvatar.textContent = u.avatar;

    // Dropdown wallet
    updateDropdownWallet();

  } else {
    // Show auth buttons, hide avatar
    if (auth)       auth.style.display       = 'flex';
    if (avatarWrap) avatarWrap.style.display  = 'none';
    if (icons)      icons.style.display       = 'none';
  }
}

// Expose globally so auth.js can call it after login
window.updateNavAuth = updateNavAuth;


/* ─────────────────────────────────────────
   DROPDOWN WALLET UPDATE
───────────────────────────────────────── */
function updateDropdownWallet() {
  const wallet = window.GPW.isLoggedIn && window.GPW.user
    ? window.GPW.user.wallet
    : (window.GPW.mockUser ? window.GPW.mockUser.wallet : null);

  if (!wallet) return;

  const ids = {
    diamonds: 'dd-diamonds',
    gold:     'dd-gold',
    silver:   'dd-silver',
    bronze:   'dd-bronze'
  };

  for (const [key, id] of Object.entries(ids)) {
    const el = document.getElementById(id);
    if (el) el.textContent = formatNumber(wallet[key]);
  }
}

window.updateDropdownWallet = updateDropdownWallet;


/* ─────────────────────────────────────────
   ACTIVE NAV LINK
───────────────────────────────────────── */
function updateNavActiveLink(page) {
  // Desktop links
  document.querySelectorAll('.navbar__link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });

  // Mobile menu items
  document.querySelectorAll('.mobile-menu__item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

window.updateNavActiveLink = updateNavActiveLink;


/* ─────────────────────────────────────────
   AVATAR DROPDOWN
───────────────────────────────────────── */
function toggleAvatarDropdown() {
  const dropdown = document.getElementById('avatarDropdown');
  const btn      = document.getElementById('navAvatar');
  if (!dropdown) return;

  const isOpen = dropdown.classList.contains('open');

  // Close other panels first
  closeNotifPanel();
  closeChatOverlay();

  dropdown.classList.toggle('open', !isOpen);
  if (btn) {
    btn.classList.toggle('open', !isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
  }

  // Position dropdown below avatar button
  if (!isOpen && btn) {
    const rect = btn.getBoundingClientRect();
    dropdown.style.top   = (rect.bottom + 4) + 'px';
    dropdown.style.right = (window.innerWidth - rect.right) + 'px';
  }
}

function closeAvatarDropdown() {
  const dropdown = document.getElementById('avatarDropdown');
  const btn      = document.getElementById('navAvatar');
  if (dropdown) dropdown.classList.remove('open');
  if (btn) {
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
}

window.toggleAvatarDropdown  = toggleAvatarDropdown;
window.closeAvatarDropdown   = closeAvatarDropdown;


/* ─────────────────────────────────────────
   MOBILE MENU
───────────────────────────────────────── */
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.getElementById('hamburgerBtn');
  if (!menu) return;

  const isOpen = menu.classList.contains('open');
  menu.classList.toggle('open', !isOpen);
  if (btn) {
    btn.classList.toggle('open', !isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
  }

  // Close other panels
  if (!isOpen) {
    closeNotifPanel();
    closeChatOverlay();
    closeAvatarDropdown();
  }
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.getElementById('hamburgerBtn');
  if (menu) menu.classList.remove('open');
  if (btn) {
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
}

window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu  = closeMobileMenu;


/* ─────────────────────────────────────────
   NOTIFICATIONS PANEL
───────────────────────────────────────── */
function toggleNotifPanel() {
  const panel    = document.getElementById('notifPanel');
  const btn      = document.getElementById('navNotifBtn');
  const chatPanel = document.getElementById('chatOverlay');
  if (!panel) return;

  const isOpen = panel.classList.contains('open');

  // Close chat if open
  if (chatPanel) chatPanel.classList.remove('open');
  closeChatOverlay();
  closeAvatarDropdown();

  panel.classList.toggle('open', !isOpen);
  if (btn) btn.classList.toggle('active', !isOpen);

  // Mark read when opened
  if (!isOpen) {
    window.GPW.unreadNotifs = 0;
    updateNotifBadge();
  }
}

function closeNotifPanel() {
  const panel = document.getElementById('notifPanel');
  const btn   = document.getElementById('navNotifBtn');
  if (panel) panel.classList.remove('open');
  if (btn)   btn.classList.remove('active');
}

function updateNotifBadge() {
  const badge = document.getElementById('notifBadge');
  const count = window.GPW.unreadNotifs || 0;
  if (!badge) return;
  if (count > 0) {
    badge.textContent  = count > 99 ? '99+' : count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

window.toggleNotifPanel  = toggleNotifPanel;
window.closeNotifPanel   = closeNotifPanel;
window.updateNotifBadge  = updateNotifBadge;


/* ─────────────────────────────────────────
   NOTIFICATIONS RENDER
───────────────────────────────────────── */
const MOCK_NOTIFICATIONS = [
  {
    id: 1, tab: 'game', unread: true, icon: '⚔',
    text: 'IronWolf attacked your city of Warsaw. Defend!',
    time: '2m ago'
  },
  {
    id: 2, tab: 'season', unread: true, icon: '🏙',
    text: 'Your bid on Moscow has been outbid. Current high: 12,400 🥇',
    time: '15m ago'
  },
  {
    id: 3, tab: 'alliance', unread: true, icon: '🤝',
    text: 'DragonSlayer99 has requested to join your alliance.',
    time: '1h ago'
  },
  {
    id: 4, tab: 'game', unread: false, icon: '🏆',
    text: 'You finished 3rd in Operation Arctic Storm. Rewards claimed!',
    time: '3h ago'
  },
  {
    id: 5, tab: 'season', unread: false, icon: '⏰',
    text: 'Season 12 city bidding closes in 2 days 14 hours.',
    time: '5h ago'
  },
  {
    id: 6, tab: 'game', unread: false, icon: '🪖',
    text: 'Your turn has started in "Blitzkrieg Europe". 24h remaining.',
    time: '6h ago'
  },
  {
    id: 7, tab: 'alliance', unread: false, icon: '📢',
    text: 'Alliance leader declared war on the Eastern Coalition.',
    time: '1d ago'
  }
];

function renderNotifications(tab) {
  const list = document.getElementById('notifList');
  if (!list) return;

  const filtered = tab === 'all'
    ? MOCK_NOTIFICATIONS
    : MOCK_NOTIFICATIONS.filter(n => n.tab === tab);

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="notif-panel__empty">
        <span class="notif-panel__empty-icon">🔕</span>
        <span class="notif-panel__empty-text">NO NOTIFICATIONS</span>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="dismissNotif(${n.id})">
      <span class="notif-item__icon">${n.icon}</span>
      <div class="notif-item__body">
        <span class="notif-item__text">${n.text}</span>
        <span class="notif-item__time">${n.time}</span>
      </div>
      ${n.unread ? '<div class="notif-item__unread-dot"></div>' : ''}
    </div>
  `).join('');
}

function dismissNotif(id) {
  const notif = MOCK_NOTIFICATIONS.find(n => n.id === id);
  if (notif) notif.unread = false;
  renderNotifications(window.GPW.notifTab);
}

window.renderNotifications = renderNotifications;
window.dismissNotif        = dismissNotif;


/* ─────────────────────────────────────────
   CHAT OVERLAY TOGGLE
───────────────────────────────────────── */
function toggleChatOverlay() {
  const overlay = document.getElementById('chatOverlay');
  const btn     = document.getElementById('navChatBtn');
  if (!overlay) return;

  const isOpen = overlay.classList.contains('open');

  closeNotifPanel();
  closeAvatarDropdown();

  overlay.classList.toggle('open', !isOpen);
  if (btn) btn.classList.toggle('active', !isOpen);

  if (!isOpen) {
    window.GPW.unreadMessages = 0;
    updateChatBadge();
    // Focus chat input
    setTimeout(() => {
      const input = document.getElementById('chatInput');
      if (input) input.focus();
    }, 300);
  }
}

function closeChatOverlay() {
  const overlay = document.getElementById('chatOverlay');
  const btn     = document.getElementById('navChatBtn');
  if (overlay) overlay.classList.remove('open');
  if (btn)     btn.classList.remove('active');
}

function updateChatBadge() {
  const badge = document.getElementById('chatBadge');
  const count = window.GPW.unreadMessages || 0;
  if (!badge) return;
  if (count > 0) {
    badge.textContent   = count > 99 ? '99+' : count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

window.toggleChatOverlay = toggleChatOverlay;
window.closeChatOverlay  = closeChatOverlay;
window.updateChatBadge   = updateChatBadge;


/* ─────────────────────────────────────────
   SEASON COUNTDOWN PILL
───────────────────────────────────────── */
function startSeasonCountdown() {
  updateSeasonPill();
  setInterval(updateSeasonPill, 60000); // update every minute
}

function updateSeasonPill() {
  const el = document.getElementById('navSeasonText');
  if (!el) return;

  const s = window.GPW.season;
  if (!s) return;

  const { days, hours } = s.endsIn;
  el.textContent = `S${s.number}: ${days}d ${hours}h`;
}

// Also update banner countdown
function updateBannerCountdown() {
  const el = document.getElementById('bannerCountdown');
  if (!el) return;
  const b = window.GPW.season.bidEndsIn;
  if (!b) return;
  el.textContent = `${b.days}d ${b.hours}h ${b.minutes}m`;
}


/* ─────────────────────────────────────────
   UTILITY: Format numbers
───────────────────────────────────────── */
function formatNumber(n) {
  if (n === undefined || n === null) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1).replace('.0','') + 'K';
  return n.toLocaleString();
}

window.formatNumber = formatNumber;


/* ─────────────────────────────────────────
   AUTH HELPERS (called from inline HTML)
───────────────────────────────────────── */
function switchAuth(tab) {
  // Switch auth modal tabs — delegated to auth.js
  const loginTab    = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const loginForm   = document.getElementById('form-login');
  const registerForm= document.getElementById('form-register');

  if (!loginTab) return; // auth modal not open yet

  const isLogin = tab === 'login';
  loginTab.classList.toggle('active', isLogin);
  registerTab.classList.toggle('active', !isLogin);
  if (loginForm)    loginForm.classList.toggle('active', isLogin);
  if (registerForm) registerForm.classList.toggle('active', !isLogin);
}

window.switchAuth = switchAuth;


/* ─────────────────────────────────────────
   BOOT — mount navbar on DOM ready
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  mountNavbar();
});
