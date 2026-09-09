/* ============================================================
   LEADERBOARD.JS — The Great Pixels War
   Handles: mock leaderboard data, category & period switching,
   table head/row rendering for global/season/alliance/friends,
   search filter, pagination, your-row pinning
   Depends on: toast.js, modals.js, router.js
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────── */
const LB_PLAYERS = [
  { rank:1,  name:'EagleEye',       avatar:'🦅', vip:'diamond', rankTitle:'General',        wins:2841, losses:540,  winRate:84, xp:198420, cities:9800, tiles:284920 },
  { rank:2,  name:'IronWolf',       avatar:'🐺', vip:'diamond', rankTitle:'General',        wins:2560, losses:600,  winRate:81, xp:175300, cities:8400, tiles:241800 },
  { rank:3,  name:'DragonSlayer99', avatar:'🐉', vip:null,      rankTitle:'Colonel',        wins:2280, losses:640,  winRate:78, xp:142800, cities:7200, tiles:198400 },
  { rank:4,  name:'StormBreaker',   avatar:'⚡', vip:null,      rankTitle:'Major',          wins:1940, losses:648,  winRate:75, xp:118500, cities:6100, tiles:176200 },
  { rank:5,  name:'CryptoGeneral',  avatar:'🔱', vip:null,      rankTitle:'Major',          wins:1820,lessly:674, winRate:73, xp:102000, cities:5600, tiles:154000 },
  { rank:6,  name:'TankCommander',  avatar:'🪖', vip:null,      rankTitle:'Captain',        wins:1540, losses:628,  winRate:71, xp:88200,  cities:4900, tiles:132800 },
  { rank:7,  name:'Pixelator',      avatar:'🎯', vip:'gold',    rankTitle:'Captain',        wins:1350, losses:630,  winRate:68, xp:74100,  cities:4200, tiles:118600 },
  { rank:8,  name:'RedBaron',       avatar:'✈',  vip:'gold',    rankTitle:'Lieutenant',     wins:1180, losses:590,  winRate:67, xp:62400,  cities:3800, tiles:98400  },
  { rank:9,  name:'NightShadow',    avatar:'👁',  vip:null,      rankTitle:'Lieutenant',     wins:1020, losses:540,  winRate:65, xp:54200,  cities:3400, tiles:84200  },
  { rank:10, name:'ArcticWolf',     avatar:'🐺', vip:null,      rankTitle:'Sergeant',       wins:920,  losses:497,  winRate:65, xp:48000,  cities:3100, tiles:72000  },
  { rank:11, name:'BlazeRunner',    avatar:'🔥', vip:null,      rankTitle:'Sergeant',       wins:840,  losses:462,  winRate:65, xp:42800,  cities:2900, tiles:64000  },
  { rank:12, name:'SteelFalcon',    avatar:'🦅', vip:null,      rankTitle:'Corporal',       wins:760,  losses:440,  winRate:63, xp:38400,  cities:2700, tiles:58000  },
  { rank:13, name:'IronFist99',     avatar:'✊',  vip:null,      rankTitle:'Corporal',       wins:680,  losses:416,  winRate:62, xp:34200,  cities:2500, tiles:52000  },
  { rank:14, name:'GhostHunter',    avatar:'👻', vip:null,      rankTitle:'Corporal',       wins:610,  losses:394,  winRate:61, xp:30400,  cities:2300, tiles:47000  },
  { rank:15, name:'WarHawk',        avatar:'🦅', vip:null,      rankTitle:'Corporal',       wins:540,  losses:360,  winRate:60, xp:27000,  cities:2100, tiles:42000  },
  { rank:42, name:'GHOST_RECON',    avatar:'🪖', vip:null,      rankTitle:'Sergeant II',    wins:148,  losses:62,   winRate:70, xp:3820,   cities:312,  tiles:0,      isYou:true }
];

const LB_ALLIANCES = [
  { rank:1,  name:'Iron Pact',      tag:'IP',  flag:'⚔',  members:48, wins:12840, territories:1284920, leader:'IronWolf'       },
  { rank:2,  name:'Steel Brotherhood',tag:'SB',flag:'🛡',  members:42, wins:10200, territories:984200,  leader:'DragonSlayer99' },
  { rank:3,  name:'Phoenix Rising', tag:'PR',  flag:'🔥',  members:36, wins:8640,  territories:824000,  leader:'EagleEye'       },
  { rank:4,  name:'Pacific Shield', tag:'PS',  flag:'🌊',  members:31, wins:7280,  territories:698400,  leader:'StormBreaker'   },
  { rank:5,  name:'Desert Storm',   tag:'DS',  flag:'🏜',  members:28, wins:6120,  territories:584200,  leader:'CryptoGeneral'  },
  { rank:6,  name:'Arctic Brigade', tag:'AB',  flag:'❄',  members:24, wins:5040,  territories:482000,  leader:'ArcticWolf'     },
  { rank:7,  name:'Night Watch',    tag:'NW',  flag:'🌙',  members:20, wins:4200,  territories:384800,  leader:'NightShadow'    },
  { rank:8,  name:'Golden Eagles',  tag:'GE',  flag:'🦅',  members:18, wins:3600,  territories:318400,  leader:'RedBaron'       }
];

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
const lbState = {
  category: 'global',
  period:   'alltime',
  search:   '',
  page:     1,
  perPage:  15
};

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
function initLeaderboard() {
  renderLeaderboard();
  updateYouBanner();
}

registerPageHook('onEnter', 'leaderboard', () => {
  initLeaderboard();
});

/* ─────────────────────────────────────────
   CATEGORY / PERIOD SWITCHING
───────────────────────────────────────── */
function setLbCategory(btn, category) {
  document.querySelectorAll('.lb-category-tabs .tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
  btn.classList.add('tab-btn--active');
  lbState.category = category;
  lbState.page     = 1;
  lbState.search   = '';
  const searchEl   = document.querySelector('.lb-page .search-input');
  if (searchEl) searchEl.value = '';
  renderLeaderboard();
}

function setLbPeriod(btn, period) {
  document.querySelectorAll('#lbPeriodTabs .tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
  btn.classList.add('tab-btn--active');
  lbState.period = period;
  lbState.page   = 1;
  renderLeaderboard();
}

function filterLeaderboard(val) {
  lbState.search = val.toLowerCase().trim();
  lbState.page   = 1;
  renderLeaderboard();
}

window.setLbCategory     = setLbCategory;
window.setLbPeriod       = setLbPeriod;
window.filterLeaderboard = filterLeaderboard;

/* ─────────────────────────────────────────
   RENDER DISPATCH
───────────────────────────────────────── */
function renderLeaderboard() {
  switch (lbState.category) {
    case 'alliance': renderAllianceLb(); break;
    case 'friends':  renderFriendsLb();  break;
    default:         renderPlayerLb();   break;
  }
}

/* ─────────────────────────────────────────
   PLAYER LEADERBOARD (global + season)
───────────────────────────────────────── */
function renderPlayerLb() {
  const headEl = document.getElementById('lbTableHead');
  const bodyEl = document.getElementById('lbTableBody');
  const pageEl = document.getElementById('lbPagination');
  if (!headEl || !bodyEl) return;

  // Column layout
  const cols = '40px 44px 2fr 1fr 1fr 100px 1fr';
  headEl.style.gridTemplateColumns = cols;
  headEl.innerHTML = `
    <div class="lb-th">#</div>
    <div class="lb-th"></div>
    <div class="lb-th">PLAYER</div>
    <div class="lb-th">RANK</div>
    <div class="lb-th">WINS</div>
    <div class="lb-th">WIN RATE</div>
    <div class="lb-th" style="text-align:right">XP</div>`;

  // Filter
  let data = LB_PLAYERS.filter(p => !p.isYou);
  if (lbState.search) {
    data = data.filter(p => p.name.toLowerCase().includes(lbState.search));
  }

  // Page slice
  const total     = data.length;
  const start     = (lbState.page - 1) * lbState.perPage;
  const pageData  = data.slice(start, start + lbState.perPage);

  if (pageData.length === 0) {
    bodyEl.innerHTML = `<div class="lb-empty"><span class="lb-empty__icon">🔍</span><span class="lb-empty__title">NO PLAYERS FOUND</span></div>`;
    if (pageEl) pageEl.innerHTML = '';
    return;
  }

  bodyEl.innerHTML = pageData.map(p => buildPlayerRow(p, cols)).join('');

  // Pinned "you" row
  const youRow = LB_PLAYERS.find(p => p.isYou);
  if (youRow && (!lbState.search || youRow.name.toLowerCase().includes(lbState.search))) {
    bodyEl.innerHTML += `
      <div style="border-top:2px solid var(--border);background:rgba(57,255,106,0.04)">
        ${buildPlayerRow(youRow, cols)}
      </div>`;
  }

  if (pageEl) renderLbPagination(pageEl, total);
}

function buildPlayerRow(p, cols) {
  const rankIcon = p.rank === 1 ? '👑' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : p.rank;
  const rankColor = p.rank === 1 ? 'var(--yellow)' : p.rank === 2 ? 'var(--silver)' : p.rank === 3 ? 'var(--bronze)' : 'var(--text-dim)';
  const vipBadge  = p.vip === 'diamond' ? ' 💎' : p.vip === 'gold' ? ' 👑' : '';
  const nameColor = p.vip === 'diamond' ? 'var(--diamond)' : p.vip === 'gold' ? 'var(--gold)' : p.isYou ? 'var(--green)' : 'var(--text)';
  const youTag    = p.isYou ? '<span class="lb-you-tag">YOU</span>' : '';

  const maxWins   = LB_PLAYERS[0]?.wins || 1;
  const barWidth  = Math.round((p.wins / maxWins) * 100);

  return `
    <div class="lb-row ${p.isYou ? 'is-you' : ''}"
      style="grid-template-columns:${cols}"
      onclick="openMiniProfile('${escapeHtml(p.name)}','${p.avatar}','${p.rankTitle}',{wins:${p.wins},losses:${p.losses||0},winRate:${p.winRate}},'${p.vip||''}')"
      role="row">
      <div style="font-family:var(--font-pixel);font-size:var(--px-xs);color:${rankColor};text-align:center">${rankIcon}</div>
      <div>
        <div style="width:36px;height:36px;background:var(--bg3);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:18px">${p.avatar}</div>
      </div>
      <div style="display:flex;align-items:center;gap:var(--space-2)">
        <span style="font-size:var(--mono-lg);color:${nameColor}">${escapeHtml(p.name)}${vipBadge}</span>
        ${youTag}
      </div>
      <div style="font-size:var(--mono-md);color:var(--text-dim)">${p.rankTitle}</div>
      <div style="font-size:var(--mono-lg)">
        <div style="background:var(--bg);border:1px solid var(--border);height:6px;width:80px;display:inline-block;vertical-align:middle;margin-right:6px">
          <div style="height:100%;width:${barWidth}%;background:var(--green)"></div>
        </div>
        ${formatNumber(p.wins)}
      </div>
      <div style="font-family:var(--font-pixel);font-size:var(--px-xs);color:${p.winRate >= 75 ? 'var(--green)' : p.winRate >= 60 ? 'var(--yellow)' : 'var(--text-dim)'}">${p.winRate}%</div>
      <div style="font-family:var(--font-pixel);font-size:var(--px-xs);color:var(--yellow);text-align:right">${formatNumber(p.xp)}</div>
    </div>`;
}

/* ─────────────────────────────────────────
   ALLIANCE LEADERBOARD
───────────────────────────────────────── */
function renderAllianceLb() {
  const headEl = document.getElementById('lbTableHead');
  const bodyEl = document.getElementById('lbTableBody');
  const pageEl = document.getElementById('lbPagination');
  if (!headEl || !bodyEl) return;

  headEl.style.gridTemplateColumns = '40px 40px 2fr 1fr 1fr 1fr';
  headEl.innerHTML = `
    <div class="lb-th">#</div>
    <div class="lb-th"></div>
    <div class="lb-th">ALLIANCE</div>
    <div class="lb-th">MEMBERS</div>
    <div class="lb-th">WINS</div>
    <div class="lb-th" style="text-align:right">TERRITORY</div>`;

  let data = [...LB_ALLIANCES];
  if (lbState.search) {
    data = data.filter(a => a.name.toLowerCase().includes(lbState.search) || a.tag.toLowerCase().includes(lbState.search));
  }

  if (data.length === 0) {
    bodyEl.innerHTML = `<div class="lb-empty"><span class="lb-empty__icon">🤝</span><span class="lb-empty__title">NO ALLIANCES FOUND</span></div>`;
    if (pageEl) pageEl.innerHTML = '';
    return;
  }

  const rankColor = (r) => r===1?'var(--yellow)':r===2?'var(--silver)':r===3?'var(--bronze)':'var(--text-dim)';
  const rankIcon  = (r) => r===1?'👑':r===2?'🥈':r===3?'🥉':r;

  bodyEl.innerHTML = data.map(a => `
    <div class="lb-alliance-row"
      onclick="openAllianceModal({name:'${escapeHtml(a.name)}',tag:'${a.tag}',flag:'${a.flag}',rank:${a.rank},members:[]})"
      role="row">
      <div style="font-family:var(--font-pixel);font-size:var(--px-xs);color:${rankColor(a.rank)};text-align:center">${rankIcon(a.rank)}</div>
      <div class="lb-alliance-flag">${a.flag}</div>
      <div>
        <div class="lb-alliance-name">${escapeHtml(a.name)} <span class="lb-alliance-tag">[${a.tag}]</span></div>
        <div style="font-size:var(--mono-sm);color:var(--text-muted)">Leader: ${escapeHtml(a.leader)}</div>
      </div>
      <div style="font-size:var(--mono-lg)">${a.members}</div>
      <div style="font-size:var(--mono-lg)">${formatNumber(a.wins)}</div>
      <div style="font-family:var(--font-pixel);font-size:var(--px-xs);color:var(--cyan);text-align:right">${formatNumber(a.territories)} 🟦</div>
    </div>`).join('');

  if (pageEl) pageEl.innerHTML = '';
}

/* ─────────────────────────────────────────
   FRIENDS LEADERBOARD
───────────────────────────────────────── */
function renderFriendsLb() {
  const bodyEl = document.getElementById('lbTableBody');
  const headEl = document.getElementById('lbTableHead');
  const pageEl = document.getElementById('lbPagination');
  if (!bodyEl) return;

  if (!window.GPW.isLoggedIn) {
    headEl.innerHTML = '';
    bodyEl.innerHTML = `
      <div class="lb-empty">
        <span class="lb-empty__icon">👥</span>
        <span class="lb-empty__title">LOG IN TO SEE FRIENDS</span>
        <button class="btn btn--green btn--sm" style="margin-top:var(--space-4)"
          onclick="openModal('auth');switchAuth('login')">LOG IN</button>
      </div>`;
    if (pageEl) pageEl.innerHTML = '';
    return;
  }

  // Mock friends subset
  const friends = LB_PLAYERS.filter(p =>
    ['Pixelator','StormBreaker','TankCommander'].includes(p.name) || p.isYou
  ).sort((a, b) => a.rank - b.rank);

  const cols = '40px 44px 2fr 1fr 1fr 100px 1fr';
  headEl.style.gridTemplateColumns = cols;
  headEl.innerHTML = `
    <div class="lb-th">#</div>
    <div class="lb-th"></div>
    <div class="lb-th">PLAYER</div>
    <div class="lb-th">RANK</div>
    <div class="lb-th">WINS</div>
    <div class="lb-th">WIN RATE</div>
    <div class="lb-th" style="text-align:right">XP</div>`;

  bodyEl.innerHTML = friends.map(p => buildPlayerRow(p, cols)).join('');
  if (pageEl) pageEl.innerHTML = '';
}

/* ─────────────────────────────────────────
   YOU BANNER UPDATE
───────────────────────────────────────── */
function updateYouBanner() {
  const user = window.GPW.user || window.GPW.mockUser;
  if (!user) return;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  // Update banner stats from user data
  const banner = document.getElementById('lbYouBanner');
  if (!banner) return;

  const vals = banner.querySelectorAll('.lb-you-banner__val');
  if (vals[0]) vals[0].textContent = formatNumber(user.stats?.wins || 148);
  if (vals[1]) vals[1].textContent = (user.stats?.winRate || 70) + '%';
  if (vals[2]) vals[2].textContent = formatNumber(user.xp || 3820);
  if (vals[3]) vals[3].textContent = user.rank || 'Sgt II';
}

/* ─────────────────────────────────────────
   PAGINATION
───────────────────────────────────────── */
function renderLbPagination(container, total) {
  const pages = Math.ceil(total / lbState.perPage);
  if (pages <= 1) { container.innerHTML = ''; return; }

  const prev = lbState.page > 1
    ? `<button class="page-btn page-btn--prev" onclick="lbGotoPage(${lbState.page-1})"></button>`
    : `<button class="page-btn page-btn--prev" disabled style="opacity:0.3"></button>`;

  const next = lbState.page < pages
    ? `<button class="page-btn page-btn--next" onclick="lbGotoPage(${lbState.page+1})"></button>`
    : `<button class="page-btn page-btn--next" disabled style="opacity:0.3"></button>`;

  const nums = Array.from({length:pages},(_,i)=>i+1)
    .filter(p => Math.abs(p-lbState.page)<=2||p===1||p===pages)
    .map(p=>`<button class="page-btn ${p===lbState.page?'page-btn--active':''}" onclick="lbGotoPage(${p})">${p}</button>`)
    .join('');

  container.innerHTML = prev + nums + next;
}

function lbGotoPage(page) {
  lbState.page = page;
  renderLeaderboard();
  document.getElementById('lbTable')?.scrollIntoView({behavior:'smooth',block:'start'});
}

window.lbGotoPage = lbGotoPage;
