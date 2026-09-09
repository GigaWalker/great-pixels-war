/* ============================================================
   LOBBY.JS — The Great Pixels War
   Handles: game table data and rendering, filter tabs,
   status/tier/mode filters, search, sort, pagination,
   player card init, online players list, lobby chat init
   Depends on: toast.js, modals.js, chat.js, router.js
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   MOCK GAME DATA
───────────────────────────────────────── */
const MOCK_GAMES = [
  { id:'g001', name:'Operation Neon Dawn',       host:'DragonSlayer99', mode:'custom',  mapTier:4, map:'🌍 World',    players:6,  maxPlayers:20, turnTimer:'24h', status:'waiting', bots:0,  password:false },
  { id:'g002', name:'Blitzkrieg Europe 1939',    host:'IronWolf',       mode:'custom',  mapTier:3, map:'🗺 Europe',   players:3,  maxPlayers:8,  turnTimer:'12h', status:'live',    bots:2,  password:false },
  { id:'g003', name:'Pacific Siege Ultra',       host:'EagleEye',       mode:'quick',   mapTier:4, map:'🌊 Pacific',  players:20, maxPlayers:20, turnTimer:'6h',  status:'live',    bots:0,  password:false },
  { id:'g004', name:'Pixel Wars: Middle East',   host:'CryptoGeneral',  mode:'custom',  mapTier:2, map:'🏜 Custom',   players:1,  maxPlayers:4,  turnTimer:'48h', status:'waiting', bots:1,  password:false },
  { id:'g005', name:'Noob Friendly 1v1',         host:'Pixelator',      mode:'custom',  mapTier:1, map:'🏙 City',     players:1,  maxPlayers:2,  turnTimer:'24h', status:'waiting', bots:0,  password:false },
  { id:'g006', name:'Grand Strategy: Asia',      host:'StormBreaker',   mode:'custom',  mapTier:3, map:'🌏 Asia',     players:9,  maxPlayers:16, turnTimer:'24h', status:'live',    bots:3,  password:false },
  { id:'g007', name:'Fantasy Realm: Dragon Age', host:'TankCommander',  mode:'sandbox', mapTier:2, map:'🏰 Fantasy',  players:4,  maxPlayers:10, turnTimer:'72h', status:'waiting', bots:6,  password:false },
  { id:'g008', name:'Arctic Warfare',            host:'DeadSniper',     mode:'private', mapTier:3, map:'❄ Arctic',   players:2,  maxPlayers:8,  turnTimer:'24h', status:'waiting', bots:0,  password:true  },
  { id:'g009', name:'Story: Iron Tide Ch.1',     host:'SERVER',         mode:'story',   mapTier:2, map:'🗺 Europe',   players:3,  maxPlayers:8,  turnTimer:'N/A', status:'live',    bots:0,  password:false },
  { id:'g010', name:'Season 12 — World War',     host:'SERVER',         mode:'season',  mapTier:4, map:'🌍 World',    players:9999,maxPlayers:99999,turnTimer:'24h',status:'live',  bots:0,  password:false },
  { id:'g011', name:'Mediterranean Campaign',    host:'Pixelator',      mode:'custom',  mapTier:2, map:'🌊 Med Sea',  players:2,  maxPlayers:6,  turnTimer:'48h', status:'waiting', bots:2,  password:false },
  { id:'g012', name:'Quick Match #442',          host:'SERVER',         mode:'quick',   mapTier:1, map:'🏙 Theater',  players:4,  maxPlayers:4,  turnTimer:'1m',  status:'live',    bots:0,  password:false }
];

const MOCK_ONLINE_PLAYERS = [
  { name:'DragonSlayer99', status:'online',  vip:null      },
  { name:'TankCommander',  status:'online',  vip:null      },
  { name:'IronWolf',       status:'ingame',  vip:'diamond' },
  { name:'CryptoGeneral',  status:'online',  vip:null      },
  { name:'EagleEye',       status:'ingame',  vip:'diamond' },
  { name:'DeadSniper',     status:'away',    vip:null      },
  { name:'Pixelator',      status:'online',  vip:'gold'    },
  { name:'StormBreaker',   status:'online',  vip:null      },
  { name:'NightShadow',    status:'online',  vip:null      },
  { name:'IronFist99',     status:'ingame',  vip:null      },
  { name:'RedBaron',       status:'online',  vip:'gold'    },
  { name:'ArcticWolf',     status:'online',  vip:null      }
];

/* ─────────────────────────────────────────
   LOBBY STATE
───────────────────────────────────────── */
const lobbyState = {
  tab:        'all',
  status:     'all',
  tier:       'all',
  search:     '',
  sortKey:    'name',
  sortDir:    'asc',
  page:       1,
  perPage:    8,
  games:      [...MOCK_GAMES]
};


/* ─────────────────────────────────────────
   INIT LOBBY
───────────────────────────────────────── */
function initLobby() {
  initPlayerCard();
  initOnlineList();
  initLobbyChat();
  renderGames();
}

// Register page hook
registerPageHook('onEnter', 'lobby', () => {
  initLobby();
});


/* ─────────────────────────────────────────
   PLAYER CARD
───────────────────────────────────────── */
function initPlayerCard() {
  const user = window.GPW.isLoggedIn
    ? window.GPW.user
    : window.GPW.mockUser;

  if (!user) return;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('lobbyUsername', user.username || 'GHOST_RECON');
  set('lobbyRank',     user.rank     || 'Recruit');
  set('lobbyTitle',    user.title    || '');

  const xpBar = document.getElementById('lobbyXpBar');
  if (xpBar && user.xp && user.xpNext) {
    xpBar.style.width = Math.min(100, Math.round((user.xp / user.xpNext) * 100)) + '%';
  }

  set('lobbyXp',     formatNumber(user.xp    || 0));
  set('lobbyXpNext', formatNumber(user.xpNext || 500) + ' XP');

  const avatar = document.getElementById('lobbyAvatar');
  if (avatar) avatar.textContent = user.avatar || '🪖';

  if (user.wallet) {
    set('lobbyDiamonds', formatNumber(user.wallet.diamonds || 0));
    set('lobbyGold',     formatNumber(user.wallet.gold     || 0));
    set('lobbySilver',   formatNumber(user.wallet.silver   || 0));
    set('lobbyBronze',   formatNumber(user.wallet.bronze   || 0));
  }
}


/* ─────────────────────────────────────────
   ONLINE PLAYERS LIST
───────────────────────────────────────── */
function initOnlineList() {
  const list  = document.getElementById('lobbyOnlineList');
  const count = document.getElementById('lobbyOnlineCount');
  if (!list) return;

  if (count) count.textContent = 'ONLINE — 14,820';

  list.innerHTML = MOCK_ONLINE_PLAYERS.map(p => {
    const dotClass = {
      online: 'dot--online',
      ingame: 'dot--ingame',
      away:   'dot--away'
    }[p.status] || 'dot--offline';

    const statusLabel = {
      online: '',
      ingame: ' [in game]',
      away:   ' [away]'
    }[p.status] || '';

    const vipIcon = p.vip === 'diamond' ? '💎' : p.vip === 'gold' ? '👑' : '';

    return `
      <div class="online-item" role="listitem"
        onclick="openMiniProfile('${escapeHtml(p.name)}','🪖','Player',{wins:100,losses:40,winRate:71},'${p.vip||''}')"
      >
        <div class="dot ${dotClass}"></div>
        <span class="online-item__name">${escapeHtml(p.name)}</span>
        <span class="online-item__status">${escapeHtml(statusLabel)}</span>
        ${vipIcon ? `<span class="online-item__vip">${vipIcon}</span>` : ''}
      </div>`;
  }).join('');
}


/* ─────────────────────────────────────────
   LOBBY CHAT INIT
───────────────────────────────────────── */
function initLobbyChat() {
  if (window.initLobbyChatPanel) window.initLobbyChatPanel();
}

function switchLobbyChat(btn, tab) {
  document.querySelectorAll('.lobby-chat-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  window.GPW.chatTab = tab;
  if (window.renderChat) window.renderChat(tab);
  // Mirror rendered content to lobby chat panel
  const lobbyPanel = document.getElementById('lobbyChatMessages');
  const mainPanel  = document.getElementById('chatMessages');
  if (lobbyPanel && mainPanel) {
    lobbyPanel.innerHTML = mainPanel.innerHTML;
    lobbyPanel.scrollTop = lobbyPanel.scrollHeight;
  }
}

window.switchLobbyChat = switchLobbyChat;


/* ─────────────────────────────────────────
   FILTER & SORT STATE
───────────────────────────────────────── */
function setLobbyTab(btn, tab) {
  document.querySelectorAll('.lobby-main .tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
  btn.classList.add('tab-btn--active');
  lobbyState.tab  = tab;
  lobbyState.page = 1;
  renderGames();
}

function setStatusFilter(btn, status) {
  btn.closest('.filter-group').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
  btn.classList.add('filter-btn--active');
  lobbyState.status = status;
  lobbyState.page   = 1;
  renderGames();
}

function setTierFilter(btn, tier) {
  btn.closest('.filter-group').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
  btn.classList.add('filter-btn--active');
  lobbyState.tier = tier;
  lobbyState.page = 1;
  renderGames();
}

function handleLobbySearch(val) {
  lobbyState.search = val.toLowerCase().trim();
  lobbyState.page   = 1;
  renderGames();
}

function sortGames(key) {
  if (lobbyState.sortKey === key) {
    lobbyState.sortDir = lobbyState.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    lobbyState.sortKey = key;
    lobbyState.sortDir = 'asc';
  }
  renderGames();
}

window.setLobbyTab      = setLobbyTab;
window.setStatusFilter  = setStatusFilter;
window.setTierFilter    = setTierFilter;
window.handleLobbySearch = handleLobbySearch;
window.sortGames        = sortGames;


/* ─────────────────────────────────────────
   FILTER + SORT GAMES
───────────────────────────────────────── */
function getFilteredGames() {
  let games = [...lobbyState.games];

  // Tab filter
  if (lobbyState.tab !== 'all') {
    games = games.filter(g => g.mode === lobbyState.tab);
  }

  // Status filter
  if (lobbyState.status !== 'all') {
    games = games.filter(g => g.status === lobbyState.status);
  }

  // Tier filter
  if (lobbyState.tier !== 'all') {
    games = games.filter(g => g.mapTier === parseInt(lobbyState.tier));
  }

  // Search
  if (lobbyState.search) {
    games = games.filter(g =>
      g.name.toLowerCase().includes(lobbyState.search) ||
      g.host.toLowerCase().includes(lobbyState.search) ||
      g.map.toLowerCase().includes(lobbyState.search)
    );
  }

  // Sort
  games.sort((a, b) => {
    let valA, valB;
    switch (lobbyState.sortKey) {
      case 'players':
        valA = a.players; valB = b.players; break;
      default:
        valA = a.name.toLowerCase(); valB = b.name.toLowerCase();
    }
    if (valA < valB) return lobbyState.sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return lobbyState.sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  return games;
}


/* ─────────────────────────────────────────
   RENDER GAME ROWS
───────────────────────────────────────── */
function renderGames() {
  const rowsEl  = document.getElementById('lobbyGameRows');
  const loadEl  = document.getElementById('lobbyTableLoading');
  const pageEl  = document.getElementById('lobbyPagination');
  if (!rowsEl) return;

  if (loadEl) loadEl.remove();

  const filtered = getFilteredGames();
  const total    = filtered.length;
  const start    = (lobbyState.page - 1) * lobbyState.perPage;
  const end      = start + lobbyState.perPage;
  const pageGames = filtered.slice(start, end);

  // Empty state
  if (pageGames.length === 0) {
    rowsEl.innerHTML = `
      <div class="lobby-empty">
        <span class="lobby-empty__icon">🔍</span>
        <span class="lobby-empty__title">NO GAMES FOUND</span>
        <span class="lobby-empty__desc">Try different filters or create your own game.</span>
        <button class="btn btn--green btn--sm" onclick="requireAuth(() => openModal('create-game'))">
          + CREATE GAME
        </button>
      </div>`;
    if (pageEl) pageEl.innerHTML = '';
    return;
  }

  // Render rows
  rowsEl.innerHTML = pageGames.map(g => buildGameRow(g)).join('');

  // Pagination
  if (pageEl) renderPagination(pageEl, total);
}


/* ─────────────────────────────────────────
   BUILD GAME ROW HTML
───────────────────────────────────────── */
function buildGameRow(g) {
  const isFull    = g.players >= g.maxPlayers;
  const isWaiting = g.status  === 'waiting';
  const isLive    = g.status  === 'live';

  const statusBadge = isLive
    ? '<span class="badge badge--live">● LIVE</span>'
    : isFull
    ? '<span class="badge badge--full">FULL</span>'
    : '<span class="badge badge--waiting">WAITING</span>';

  const playersDisplay = isFull
    ? `<span class="full">${g.players === 99999 ? '9,999+' : g.players}</span>/${g.maxPlayers === 99999 ? '∞' : g.maxPlayers}`
    : `<span class="ok">${g.players}</span>/${g.maxPlayers}`;

  const modeBadge = buildModeBadge(g.mode);

  const actionBtn = isFull
    ? `<button class="btn btn--ghost btn--xs" onclick="event.stopPropagation(); watchGame('${g.id}')">WATCH</button>`
    : isLive
    ? `<button class="btn btn--cyan btn--xs" onclick="event.stopPropagation(); watchGame('${g.id}')">WATCH</button>`
    : `<button class="btn btn--green btn--xs" onclick="event.stopPropagation(); joinGame('${g.id}')">JOIN</button>`;

  const passwordIcon = g.password ? '🔒 ' : '';
  const botIcon      = g.bots > 0 ? ` 🤖${g.bots}` : '';

  return `
    <div class="game-row" role="row" onclick="toggleGameDetail('${g.id}')"
      tabindex="0" onkeydown="if(event.key==='Enter')toggleGameDetail('${g.id}')"
      aria-label="Game: ${escapeHtml(g.name)}">
      <div class="game-row__name" role="cell">
        ${passwordIcon}${escapeHtml(g.name)}${botIcon}
        <small class="game-row__host">by ${escapeHtml(g.host)}</small>
      </div>
      <div role="cell">${modeBadge}</div>
      <div role="cell">
        <span class="game-row__map-badge">${escapeHtml(g.map)}</span>
      </div>
      <div class="game-row__players" role="cell">${playersDisplay}</div>
      <div role="cell" style="font-size:var(--mono-md);color:var(--text-dim)">${g.turnTimer}</div>
      <div role="cell">${statusBadge}</div>
      <div class="game-row__actions" role="cell">${actionBtn}</div>
    </div>
    <div class="game-row-details" id="detail-${g.id}" role="row">
      <div class="game-detail-item">
        <span class="game-detail-item__label">MAP TIER</span>
        <span class="game-detail-item__value">Tier ${g.mapTier} — ${['','Theater','Regional','Continental','Global'][g.mapTier]}</span>
      </div>
      <div class="game-detail-item">
        <span class="game-detail-item__label">TURN TIMER</span>
        <span class="game-detail-item__value">${g.turnTimer}</span>
      </div>
      <div class="game-detail-item">
        <span class="game-detail-item__label">BOTS</span>
        <span class="game-detail-item__value">${g.bots > 0 ? g.bots + ' bots' : 'No bots'}</span>
      </div>
      <div class="game-detail-item">
        <span class="game-detail-item__label">ACCESS</span>
        <span class="game-detail-item__value">${g.password ? '🔒 Password protected' : '🔓 Public'}</span>
      </div>
    </div>`;
}

function buildModeBadge(mode) {
  const map = {
    season:  ['SEASON', 'season'],
    story:   ['STORY',  'story'],
    quick:   ['QUICK',  'quick'],
    custom:  ['CUSTOM', 'custom'],
    private: ['PRIVATE','private'],
    sandbox: ['SANDBOX','sandbox']
  };
  const [label, cls] = map[mode] || ['GAME', 'custom'];
  return `<span class="game-row__mode-badge game-row__mode-badge--${cls}">${label}</span>`;
}


/* ─────────────────────────────────────────
   GAME ROW EXPAND / COLLAPSE
───────────────────────────────────────── */
function toggleGameDetail(id) {
  const detail = document.getElementById('detail-' + id);
  if (!detail) return;
  detail.classList.toggle('open');
}

window.toggleGameDetail = toggleGameDetail;


/* ─────────────────────────────────────────
   JOIN / WATCH ACTIONS
───────────────────────────────────────── */
function joinGame(id) {
  requireAuth(() => {
    const game = lobbyState.games.find(g => g.id === id);
    if (!game) return;
    showToastFull('JOINING GAME', game.name, 'success', '⚔', 3000);
  });
}

function watchGame(id) {
  const game = lobbyState.games.find(g => g.id === id);
  if (!game) return;
  showToastFull('SPECTATING', game.name, 'info', '👁', 3000);
}

window.joinGame  = joinGame;
window.watchGame = watchGame;


/* ─────────────────────────────────────────
   PAGINATION
───────────────────────────────────────── */
function renderPagination(container, total) {
  const pages = Math.ceil(total / lobbyState.perPage);
  if (pages <= 1) { container.innerHTML = ''; return; }

  const prev = lobbyState.page > 1
    ? `<button class="page-btn page-btn--prev" onclick="gotoPage(${lobbyState.page - 1})" aria-label="Previous page"></button>`
    : `<button class="page-btn page-btn--prev" disabled aria-label="Previous page" style="opacity:0.3"></button>`;

  const next = lobbyState.page < pages
    ? `<button class="page-btn page-btn--next" onclick="gotoPage(${lobbyState.page + 1})" aria-label="Next page"></button>`
    : `<button class="page-btn page-btn--next" disabled aria-label="Next page" style="opacity:0.3"></button>`;

  const nums = Array.from({ length: pages }, (_, i) => i + 1)
    .filter(p => Math.abs(p - lobbyState.page) <= 2 || p === 1 || p === pages)
    .map(p => `
      <button class="page-btn ${p === lobbyState.page ? 'page-btn--active' : ''}"
        onclick="gotoPage(${p})" aria-label="Page ${p}" aria-current="${p === lobbyState.page ? 'page' : 'false'}">
        ${p}
      </button>`).join('');

  container.innerHTML = prev + nums + next;
}

function gotoPage(page) {
  lobbyState.page = page;
  renderGames();
  const table = document.getElementById('lobbyGameTable');
  if (table) table.scrollIntoView({ behavior:'smooth', block:'start' });
}

window.gotoPage = gotoPage;