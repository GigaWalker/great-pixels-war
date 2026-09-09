/* ============================================================
   SEASON-WAR.JS — The Great Pixels War
   Handles: bid panels, hot cities list, season leaderboard,
   turn status bar timer, map view switching, day/night cycle,
   page init and lifecycle hooks
   Depends on: toast.js, modals.js, router.js
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────── */
const MOCK_MY_BIDS = [
  { city:'Paris',   region:'France',        icon:'🏙', currentBid:8200,  myBid:9500,  status:'leading', value:'High'   },
  { city:'Moscow',  region:'Russia',        icon:'🏛', currentBid:12400, myBid:11800, status:'outbid',  value:'Very High' },
  { city:'Cairo',   region:'Egypt',         icon:'🕌', currentBid:4800,  myBid:5200,  status:'leading', value:'Medium' }
];

const MOCK_HOT_CITIES = [
  { city:'London',     region:'England',    icon:'🏰', bids:284, topBid:22000, value:'Very High' },
  { city:'New York',   region:'USA',        icon:'🗽', bids:241, topBid:19500, value:'Very High' },
  { city:'Tokyo',      region:'Japan',      icon:'🗼', bids:198, topBid:17200, value:'High'      },
  { city:'Beijing',    region:'China',      icon:'🏯', bids:176, topBid:15800, value:'High'      },
  { city:'Berlin',     region:'Germany',    icon:'🦅', bids:142, topBid:13400, value:'High'      }
];

const MOCK_SW_LEADERBOARD = [
  { rank:1,  name:'EagleEye',      vip:'diamond', tiles:284920, isYou:false },
  { rank:2,  name:'IronWolf',      vip:'diamond', tiles:241800, isYou:false },
  { rank:3,  name:'DragonSlayer99',vip:null,      tiles:198400, isYou:false },
  { rank:4,  name:'StormBreaker',  vip:null,      tiles:176200, isYou:false },
  { rank:5,  name:'CryptoGeneral', vip:null,      tiles:154000, isYou:false },
  { rank:6,  name:'TankCommander', vip:null,      tiles:132800, isYou:false },
  { rank:7,  name:'Pixelator',     vip:'gold',    tiles:118600, isYou:false },
  { rank:8,  name:'RedBaron',      vip:'gold',    tiles:98400,  isYou:false },
  { rank:9,  name:'NightShadow',   vip:null,      tiles:84200,  isYou:false },
  { rank:10, name:'ArcticWolf',    vip:null,      tiles:72000,  isYou:false },
  { rank:42, name:'GHOST_RECON',   vip:null,      tiles:0,      isYou:true  }
];

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
function initSeasonWar() {
  renderMyBids();
  renderHotCities();
  renderSWLeaderboard();
  initDayNightCycle();
  startTurnTimer();
  initMyStats();
}

registerPageHook('onEnter', 'season-war', () => {
  initSeasonWar();
});

/* ─────────────────────────────────────────
   MY BIDS PANEL
───────────────────────────────────────── */
function renderMyBids() {
  const list    = document.getElementById('swMyBidsList');
  const countEl = document.getElementById('swMyBidCount');
  if (!list) return;

  if (countEl) countEl.textContent = MOCK_MY_BIDS.length + ' active';

  if (MOCK_MY_BIDS.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:var(--space-5);color:var(--text-muted);font-size:var(--mono-md)">
        No bids placed yet.<br>
        <button class="btn btn--yellow btn--sm" style="margin-top:var(--space-3)"
          onclick="showHotCitiesBid()">BID ON A CITY</button>
      </div>`;
    return;
  }

  list.innerHTML = MOCK_MY_BIDS.map(b => {
    const isLeading = b.status === 'leading';
    const statusEl  = isLeading
      ? `<span class="sw-bid-row__status-leading">✓ LEADING</span>`
      : `<span class="sw-bid-row__status-outbid">⚠ OUTBID</span>`;

    return `
      <div class="sw-bid-row" onclick="openBidModal({
        name:'${escapeHtml(b.city)}',
        region:'${escapeHtml(b.region)}',
        icon:'${b.icon}',
        currentBid:${b.currentBid},
        value:'${b.value}'
      })">
        <div class="sw-bid-row__city">
          <span class="sw-bid-row__city-name">${b.icon} ${escapeHtml(b.city)}</span>
          <span class="sw-bid-row__city-meta">${escapeHtml(b.region)} · ${b.value}</span>
        </div>
        <div style="text-align:right">
          <span class="sw-bid-row__amount">🥇 ${formatNumber(b.myBid)}</span><br>
          ${statusEl}
        </div>
      </div>`;
  }).join('');
}

function showAllBids() {
  showToast('Full bid history coming soon!', 'info');
}

window.showAllBids = showAllBids;
window.renderMyBids = renderMyBids;

/* ─────────────────────────────────────────
   HOT CITIES
───────────────────────────────────────── */
function renderHotCities() {
  const el = document.getElementById('swHotCities');
  if (!el) return;

  el.innerHTML = MOCK_HOT_CITIES.map(c => `
    <div class="sw-bid-row" onclick="openBidModal({
      name:'${escapeHtml(c.city)}',
      region:'${escapeHtml(c.region)}',
      icon:'${c.icon}',
      currentBid:${c.topBid},
      value:'${c.value}'
    })">
      <div class="sw-bid-row__city">
        <span class="sw-bid-row__city-name">${c.icon} ${escapeHtml(c.city)}</span>
        <span class="sw-bid-row__city-meta">${escapeHtml(c.region)} · ${c.bids} bids</span>
      </div>
      <div style="text-align:right">
        <span class="sw-bid-row__amount">🥇 ${formatNumber(c.topBid)}</span><br>
        <span style="font-size:var(--mono-sm);color:var(--text-muted)">${c.value}</span>
      </div>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────
   SEASON LEADERBOARD
───────────────────────────────────────── */
function renderSWLeaderboard() {
  const el = document.getElementById('swLeaderboard');
  if (!el) return;

  const user = window.GPW.user || window.GPW.mockUser;
  const username = user?.username || 'GHOST_RECON';

  // Show top 10 + player row
  const top10   = MOCK_SW_LEADERBOARD.filter(r => r.rank <= 10);
  const youRow  = MOCK_SW_LEADERBOARD.find(r => r.isYou);
  const showYou = youRow && youRow.rank > 10;

  const rankClass = (rank) => {
    if (rank === 1) return 'sw-lb-row__rank--1';
    if (rank === 2) return 'sw-lb-row__rank--2';
    if (rank === 3) return 'sw-lb-row__rank--3';
    return 'sw-lb-row__rank--other';
  };

  const rankIcon = (rank) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const buildRow = (r) => {
    const vipTag = r.vip === 'diamond' ? ' 💎' : r.vip === 'gold' ? ' 👑' : '';
    const isYou  = r.name === username || r.isYou;
    return `
      <div class="sw-lb-row" onclick="openMiniProfile('${escapeHtml(r.name)}','🪖','Player',{wins:100,losses:40,winRate:71},'${r.vip||''}')">
        <span class="sw-lb-row__rank ${rankClass(r.rank)}">${rankIcon(r.rank)}</span>
        <span class="sw-lb-row__name ${isYou ? 'is-you' : ''}">${escapeHtml(r.name)}${vipTag}</span>
        <span class="sw-lb-row__tiles">${r.tiles > 0 ? formatNumber(r.tiles) + ' 🟦' : '—'}</span>
      </div>`;
  };

  let html = top10.map(buildRow).join('');

  if (showYou) {
    html += `<div style="border-top:1px solid var(--border);margin:var(--space-1) 0"></div>`;
    html += buildRow(youRow);
  }

  el.innerHTML = html;
}

/* ─────────────────────────────────────────
   INIT MY STATS
───────────────────────────────────────── */
function initMyStats() {
  const user = window.GPW.user || window.GPW.mockUser;
  if (!user) return;

  const el = document.getElementById('swMyTerritory');
  if (el) el.textContent = '0 tiles';

  const rankEl = document.getElementById('swMyRank');
  if (rankEl) rankEl.textContent = '#42';
}

/* ─────────────────────────────────────────
   MAP VIEW TOGGLE
───────────────────────────────────────── */
function setMapView(btn, view) {
  document.querySelectorAll('.sw-map-btn').forEach(b => b.classList.remove('sw-map-btn--active'));
  btn.classList.add('sw-map-btn--active');
  showToast('Map view: ' + view.toUpperCase(), 'neutral');
}

window.setMapView = setMapView;

/* ─────────────────────────────────────────
   DAY / NIGHT CYCLE
───────────────────────────────────────── */
function initDayNightCycle() {
  updateDayNight();
  setInterval(updateDayNight, 60000);
}

function updateDayNight() {
  const iconEl  = document.getElementById('swDayNightIcon');
  const labelEl = document.getElementById('swDayNightLabel');
  if (!iconEl || !labelEl) return;

  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 20;

  iconEl.textContent  = isDay ? '☀' : '🌙';
  labelEl.textContent = isDay ? 'DAY' : 'NIGHT';
}

/* ─────────────────────────────────────────
   TURN TIMER
───────────────────────────────────────── */
let _turnTimerInterval = null;

function startTurnTimer() {
  stopTurnTimer();

  // Mock: 23h 41m remaining
  let totalSeconds = 23 * 3600 + 41 * 60;

  updateTurnTimerDisplay(totalSeconds);

  _turnTimerInterval = setInterval(() => {
    totalSeconds = Math.max(0, totalSeconds - 1);
    updateTurnTimerDisplay(totalSeconds);

    if (totalSeconds === 0) {
      stopTurnTimer();
      showToastFull('TURN ENDED', 'Turn 12 has ended. Turn 13 begins!', 'season', '⏰', 6000);
    }
  }, 1000);
}

function stopTurnTimer() {
  if (_turnTimerInterval) {
    clearInterval(_turnTimerInterval);
    _turnTimerInterval = null;
  }
}

function updateTurnTimerDisplay(seconds) {
  const el = document.getElementById('swTurnTimer');
  if (!el) return;

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    el.textContent = `${h}h ${String(m).padStart(2,'0')}m`;
  } else if (m > 0) {
    el.textContent = `${m}m ${String(s).padStart(2,'0')}s`;
    el.classList.add('turn-bar__value--warning');
  } else {
    el.textContent = `${s}s`;
    el.classList.add('turn-bar__value--warning');
  }
}

registerPageHook('onLeave', 'season-war', () => {
  stopTurnTimer();
});

/* ─────────────────────────────────────────
   TAKE TURN
───────────────────────────────────────── */
function handleTakeTurn() {
  requireAuth(() => {
    const statusEl = document.getElementById('swTurnStatus');
    if (statusEl) {
      statusEl.textContent = '⚔ YOUR TURN';
      statusEl.className   = 'turn-bar__value turn-bar__value--active';
    }
    showToastFull(
      'YOUR TURN',
      'You have taken control. Bot is standby.',
      'success', '⚔', 4000
    );
  });
}

window.handleTakeTurn  = handleTakeTurn;
window.initSeasonWar   = initSeasonWar;
window.showHotCitiesBid = () => {
  if (MOCK_HOT_CITIES[0]) {
    openBidModal({
      name:       MOCK_HOT_CITIES[0].city,
      region:     MOCK_HOT_CITIES[0].region,
      icon:       MOCK_HOT_CITIES[0].icon,
      currentBid: MOCK_HOT_CITIES[0].topBid,
      value:      MOCK_HOT_CITIES[0].value
    });
  }
};
