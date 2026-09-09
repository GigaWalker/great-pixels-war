/* ============================================================
   PROFILE.JS — The Great Pixels War
   Handles: profile header init, tab switching, all 6 panel
   renders: stats, season history, cosmetics, alliance,
   achievements, bid history
   Depends on: toast.js, modals.js, router.js
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   MOCK PROFILE DATA
───────────────────────────────────────── */
const MOCK_SEASON_HISTORY = [
  { season:11, name:'Operation Desert Veil',   rank:28,  tiles:42000, wins:24, rewards:{ diamonds:200, gold:500,  silver:2000, bronze:5000 }, alliance:'Steel Brotherhood' },
  { season:10, name:'Operation Arctic Storm',  rank:51,  tiles:28000, wins:18, rewards:{ diamonds:0,   gold:0,    silver:1000, bronze:5000 }, alliance:'None' },
  { season:9,  name:'Operation Pacific Dawn',  rank:104, tiles:14000, wins:12, rewards:{ diamonds:0,   gold:0,    silver:0,    bronze:5000 }, alliance:'None' },
  { season:8,  name:'Operation Iron Shield',   rank:210, tiles:6000,  wins:8,  rewards:{ diamonds:0,   gold:0,    silver:0,    bronze:5000 }, alliance:'None' }
];

const MOCK_EQUIPPED = [
  { slot:'INFANTRY',  name:'Desert Rifleman', icon:'🪖', tier:'common'  },
  { slot:'TANK',      name:'(none)',           icon:'—',  tier:null,     empty:true },
  { slot:'NAVAL',     name:'(none)',           icon:'—',  tier:null,     empty:true },
  { slot:'AIR',       name:'(none)',           icon:'—',  tier:null,     empty:true },
  { slot:'BUILDING',  name:'(none)',           icon:'—',  tier:null,     empty:true },
  { slot:'MAP THEME', name:'Default Satellite',icon:'🛰', tier:'common'  },
  { slot:'BORDER',    name:'Iron General',     icon:'🔲', tier:'common'  },
  { slot:'TITLE',     name:'Iron Veteran',     icon:'🎖', tier:'common'  }
];

const MOCK_ACHIEVEMENTS = [
  { icon:'⚔',  name:'FIRST BLOOD',        desc:'Win your first game',                   unlocked:true,  date:'Season 8'   },
  { icon:'🏙',  name:'CITY CONQUEROR',     desc:'Capture 100 cities in a single season', unlocked:true,  date:'Season 9'   },
  { icon:'🤝',  name:'ALLIANCE FOUNDER',   desc:'Create your first alliance',            unlocked:false                    },
  { icon:'🌍',  name:'WORLD DOMINATOR',    desc:'Hold 10% of the global map tiles',      unlocked:false                    },
  { icon:'💎',  name:'DIAMOND ELITE',      desc:'Reach Command tier cosmetics',          unlocked:false                    },
  { icon:'🏆',  name:'TOP 10 FINISHER',    desc:'Finish in the top 10 of Season War',    unlocked:false                    },
  { icon:'🥇',  name:'CENTURION',          desc:'Win 100 games total',                   unlocked:true,  date:'Season 11'  },
  { icon:'⭐',  name:'SEASON VETERAN',     desc:'Participate in 4 seasons',              unlocked:true,  date:'Season 11'  },
  { icon:'🤖',  name:'BOT WHISPERER',      desc:'Win 10 games with bot orders active',   unlocked:false                    },
  { icon:'🛡',  name:'LAST STAND',         desc:'Successfully defend against 50 attacks',unlocked:true,  date:'Season 10'  },
  { icon:'✈',  name:'AIR SUPERIORITY',    desc:'Destroy 200 units with air forces',     unlocked:false                    },
  { icon:'⚓',  name:'NAVAL COMMANDER',    desc:'Win a game with only naval units',       unlocked:false                    }
];

const MOCK_BID_HISTORY = [
  { season:12, city:'Paris',   region:'France',  icon:'🏙', myBid:9500,  result:'leading',  value:'High'      },
  { season:12, city:'Cairo',   region:'Egypt',   icon:'🕌', myBid:5200,  result:'leading',  value:'Medium'    },
  { season:12, city:'Moscow',  region:'Russia',  icon:'🏛', myBid:11800, result:'outbid',   value:'Very High' },
  { season:11, city:'Berlin',  region:'Germany', icon:'🦅', myBid:8400,  result:'won',      value:'High'      },
  { season:11, city:'Rome',    region:'Italy',   icon:'🏛', myBid:6200,  result:'lost',     value:'Medium'    },
  { season:10, city:'Lagos',   region:'Nigeria', icon:'🏙', myBid:3100,  result:'won',      value:'Low'       }
];

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
function initProfile() {
  populateProfileHeader();
  renderProfileTab('stats');
}

registerPageHook('onEnter', 'profile', () => {
  initProfile();
});

/* ─────────────────────────────────────────
   HEADER POPULATION
───────────────────────────────────────── */
function populateProfileHeader() {
  const user = window.GPW.isLoggedIn ? window.GPW.user : window.GPW.mockUser;
  if (!user) return;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHtml = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

  // Avatar
  const avatarEl = document.getElementById('profileAvatar');
  if (avatarEl) avatarEl.textContent = user.avatar || '🪖';

  // VIP badge
  const vipEl = document.getElementById('profileVipBadge');
  if (vipEl) {
    if (user.vip === 'diamond') { vipEl.textContent = '💎'; vipEl.style.display = 'block'; }
    else if (user.vip === 'gold') { vipEl.textContent = '👑'; vipEl.style.display = 'block'; }
    else { vipEl.style.display = 'none'; }
  }

  // Name with VIP colour
  const nameEl = document.getElementById('profileName');
  if (nameEl) {
    nameEl.textContent = user.username || 'GHOST_RECON';
    nameEl.className   = 'profile-info__name' +
      (user.vip === 'diamond' ? ' vip-diamond' :
       user.vip === 'gold'    ? ' vip-gold'    : '');
  }

  set('profileTitle',  user.title    || 'New Recruit');
  set('profileRank',   user.rank     || 'Recruit');
  set('profileFlag',   user.flag     || '🏴');
  set('profileJoin',   'Joined Season 8');
  set('profileSeason', 'Season 12 Active');

  // XP bar
  const xpBar = document.getElementById('profileXpBar');
  if (xpBar && user.xp && user.xpNext) {
    xpBar.style.width = Math.min(100, Math.round((user.xp / user.xpNext) * 100)) + '%';
  }
  set('profileXp',    formatNumber(user.xp    || 0) + ' XP');
  set('profileXpNext', formatNumber(user.xpNext || 500));

  // Wallet
  if (user.wallet) {
    set('profileDiamonds', formatNumber(user.wallet.diamonds || 0));
    set('profileGold',     formatNumber(user.wallet.gold     || 0));
    set('profileSilver',   formatNumber(user.wallet.silver   || 0));
    set('profileBronze',   formatNumber(user.wallet.bronze   || 0));
  }
}

/* ─────────────────────────────────────────
   TAB SWITCHING
───────────────────────────────────────── */
function setProfileTab(btn, tab) {
  document.querySelectorAll('#profileTabGroup .tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
  btn.classList.add('tab-btn--active');
  renderProfileTab(tab);
}

window.setProfileTab = setProfileTab;

function renderProfileTab(tab) {
  const content = document.getElementById('profileContent');
  if (!content) return;

  switch(tab) {
    case 'stats':        content.innerHTML = buildStatsPanel();        break;
    case 'seasons':      content.innerHTML = buildSeasonsPanel();      break;
    case 'cosmetics':    content.innerHTML = buildCosmeticsPanel();    break;
    case 'alliance':     content.innerHTML = buildAlliancePanel();     break;
    case 'achievements': content.innerHTML = buildAchievementsPanel(); break;
    case 'bids':         content.innerHTML = buildBidsPanel();         break;
    default:             content.innerHTML = buildStatsPanel();
  }
}

/* ─────────────────────────────────────────
   STATS PANEL
───────────────────────────────────────── */
function buildStatsPanel() {
  const user  = window.GPW.isLoggedIn ? window.GPW.user : window.GPW.mockUser;
  const stats = user?.stats || { wins:148, losses:62, winRate:70, turns:4820, cities:312, units:9841 };
  const total = (stats.wins || 0) + (stats.losses || 0);
  const winPct  = total > 0 ? Math.round((stats.wins  / total) * 100) : 0;
  const lossPct = total > 0 ? Math.round((stats.losses / total) * 100) : 0;

  const statCards = [
    { val: formatNumber(stats.wins   || 0), key:'WINS',           color:'var(--green)'  },
    { val: formatNumber(stats.losses || 0), key:'LOSSES',         color:'var(--red)'    },
    { val: (stats.winRate || 0) + '%',      key:'WIN RATE',       color:'var(--yellow)' },
    { val: formatNumber(stats.turns  || 0), key:'TURNS PLAYED',   color:'var(--cyan)'   },
    { val: formatNumber(stats.cities || 0), key:'CITIES CAPTURED',color:'var(--text)'   },
    { val: formatNumber(stats.units  || 0), key:'UNITS DESTROYED',color:'var(--text)'   },
    { val: '4',                             key:'SEASONS PLAYED',  color:'var(--text)'   },
    { val: 'Tier III',                      key:'FARTHEST MAP',    color:'var(--cyan)'   }
  ].map(s => `
    <div class="profile-stat-card">
      <span class="profile-stat-card__val" style="color:${s.color}">${s.val}</span>
      <span class="profile-stat-card__key">${s.key}</span>
    </div>`).join('');

  return `
    <div class="profile-stats-grid">${statCards}</div>

    <div class="profile-wl-bar">
      <div class="profile-wl-bar__label">WIN / LOSS RATIO</div>
      <div class="profile-wl-track">
        <div class="profile-wl-win"  style="width:${winPct}%"></div>
        <div class="profile-wl-loss" style="width:${lossPct}%"></div>
      </div>
      <div class="profile-wl-legend">
        <div class="profile-wl-legend__item">
          <div class="profile-wl-legend__dot" style="background:var(--green)"></div>
          <span style="color:var(--green)">${formatNumber(stats.wins||0)} Wins (${winPct}%)</span>
        </div>
        <div class="profile-wl-legend__item">
          <div class="profile-wl-legend__dot" style="background:var(--red-dim)"></div>
          <span style="color:var(--red)">${formatNumber(stats.losses||0)} Losses (${lossPct}%)</span>
        </div>
      </div>
    </div>

    <div class="section-title" style="margin-top:var(--space-6)">FAVOURITE UNITS</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:var(--space-3)">
      ${[
        { unit:'Rifleman', icon:'🪖', games:84,  winRate:72 },
        { unit:'Main Battle Tank', icon:'🚗', games:61, winRate:68 },
        { unit:'Fighter Jet', icon:'✈', games:38, winRate:74 },
        { unit:'Destroyer', icon:'⚓', games:22, winRate:65 }
      ].map(u => `
        <div style="background:var(--panel);border:var(--border-w) solid var(--border);padding:var(--space-4);display:flex;align-items:center;gap:var(--space-3)">
          <span style="font-size:28px">${u.icon}</span>
          <div>
            <div style="font-family:var(--font-pixel);font-size:6px;color:var(--text);letter-spacing:1px;margin-bottom:4px">${u.unit}</div>
            <div style="font-size:var(--mono-sm);color:var(--text-dim)">${u.games} games · ${u.winRate}% WR</div>
          </div>
        </div>`).join('')}
    </div>`;
}

/* ─────────────────────────────────────────
   SEASON HISTORY PANEL
───────────────────────────────────────── */
function buildSeasonsPanel() {
  const rows = MOCK_SEASON_HISTORY.map(s => {
    const rankColor = s.rank <= 10 ? 'var(--yellow)' : s.rank <= 50 ? 'var(--cyan)' : 'var(--text-dim)';
    const rewards   = [];
    if (s.rewards.diamonds > 0) rewards.push(`<span class="cur-diamond">💎 ${formatNumber(s.rewards.diamonds)}</span>`);
    if (s.rewards.gold     > 0) rewards.push(`<span class="cur-gold">🥇 ${formatNumber(s.rewards.gold)}</span>`);
    if (s.rewards.silver   > 0) rewards.push(`<span class="cur-silver">🥈 ${formatNumber(s.rewards.silver)}</span>`);
    if (s.rewards.bronze   > 0) rewards.push(`<span class="cur-bronze">🥉 ${formatNumber(s.rewards.bronze)}</span>`);

    return `
      <div class="profile-season-row">
        <div class="profile-season-row__num">S${s.season}</div>
        <div>
          <div class="profile-season-row__name">${escapeHtml(s.name)}</div>
          <div class="profile-season-row__meta">
            <span>👥 Alliance: ${escapeHtml(s.alliance)}</span>
            <span>⚔ ${s.wins} wins</span>
            <span>🟦 ${formatNumber(s.tiles)} tiles</span>
          </div>
        </div>
        <div class="profile-season-row__rewards">
          <div style="font-family:var(--font-pixel);font-size:6px;color:${rankColor};letter-spacing:1px">RANK #${s.rank}</div>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;justify-content:flex-end;font-family:var(--font-pixel);font-size:6px">
            ${rewards.join('')}
          </div>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="section-title">SEASON HISTORY</div>
    <div class="profile-season-list">${rows}</div>`;
}

/* ─────────────────────────────────────────
   COSMETICS PANEL
───────────────────────────────────────── */
function buildCosmeticsPanel() {
  const cards = MOCK_EQUIPPED.map(item => `
    <div class="profile-equipped-card ${item.empty ? 'profile-equipped-card--empty' : ''}"
      onclick="${!item.empty ? `navigate('shop')` : 'null'}">
      <span class="profile-equipped-card__icon">${item.icon}</span>
      <div class="profile-equipped-card__name">${escapeHtml(item.name)}</div>
      <div class="profile-equipped-card__slot">${item.slot}</div>
      ${item.tier ? `<div style="font-family:var(--font-pixel);font-size:5px;color:var(--tier-${item.tier});margin-top:4px;letter-spacing:1px">${item.tier.toUpperCase()}</div>` : ''}
    </div>`).join('');

  return `
    <div class="section-title">EQUIPPED COSMETICS</div>
    <div class="profile-equipped-grid">${cards}</div>
    <div style="margin-top:var(--space-6);text-align:center">
      <button class="btn btn--diamond btn--lg" onclick="navigate('shop')">
        🛒 BROWSE SHOP FOR MORE
      </button>
    </div>`;
}

/* ─────────────────────────────────────────
   ALLIANCE PANEL
───────────────────────────────────────── */
function buildAlliancePanel() {
  const user = window.GPW.isLoggedIn ? window.GPW.user : window.GPW.mockUser;
  const hasAlliance = user?.alliance;

  if (!hasAlliance) {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--space-12);gap:var(--space-5);text-align:center">
        <span style="font-size:52px">🏴</span>
        <div style="font-family:var(--font-pixel);font-size:var(--px-md);color:var(--text-dim);letter-spacing:1px">NO ALLIANCE</div>
        <div style="font-size:var(--mono-lg);color:var(--text-muted);max-width:400px;line-height:1.7">
          Join an alliance to fight alongside other players in Season War,
          access the alliance chat, and climb the alliance leaderboard.
        </div>
        <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;justify-content:center">
          <button class="btn btn--green btn--lg" onclick="openAllianceModal(null)">+ CREATE ALLIANCE</button>
          <button class="btn btn--cyan btn--lg" onclick="navigate('leaderboard'); setLbCategory(document.querySelector('.lb-category-tabs .tab-btn:nth-child(3)'), 'alliance')">🔍 FIND ALLIANCE</button>
        </div>
      </div>`;
  }

  return `
    <div class="section-title">MY ALLIANCE</div>
    <div style="background:var(--panel);border:var(--border-w) solid var(--cyan);padding:var(--space-6);display:flex;align-items:center;gap:var(--space-5);flex-wrap:wrap;margin-bottom:var(--space-5)">
      <div style="font-size:48px">${hasAlliance.flag || '🏴'}</div>
      <div style="flex:1">
        <div style="font-family:var(--font-pixel);font-size:var(--px-lg);color:var(--cyan);letter-spacing:1px;margin-bottom:var(--space-2)">${escapeHtml(hasAlliance.name)}</div>
        <div style="font-size:var(--mono-md);color:var(--text-dim)">Tag: [${escapeHtml(hasAlliance.tag||'')}] · Rank #${hasAlliance.rank||'?'} · Your role: Member</div>
      </div>
      <button class="btn btn--cyan btn--sm" onclick="openAllianceModal(${JSON.stringify(hasAlliance).replace(/'/g,'&#39;')})">VIEW ALLIANCE</button>
    </div>`;
}

/* ─────────────────────────────────────────
   ACHIEVEMENTS PANEL
───────────────────────────────────────── */
function buildAchievementsPanel() {
  const unlocked = MOCK_ACHIEVEMENTS.filter(a => a.unlocked).length;

  const cards = MOCK_ACHIEVEMENTS.map(a => `
    <div class="profile-achievement ${a.unlocked ? 'unlocked' : 'locked'}">
      <span class="profile-achievement__icon" style="opacity:${a.unlocked?1:0.3}">${a.icon}</span>
      <div>
        <div class="profile-achievement__name" style="color:${a.unlocked?'var(--text)':'var(--text-muted)'}">${a.name}</div>
        <div class="profile-achievement__desc">${a.desc}</div>
        ${a.unlocked && a.date ? `<div class="profile-achievement__date">✓ ${a.date}</div>` : ''}
      </div>
    </div>`).join('');

  return `
    <div class="section-title">ACHIEVEMENTS <span style="font-family:var(--font-mono);font-size:var(--mono-md);color:var(--text-muted)">${unlocked}/${MOCK_ACHIEVEMENTS.length} unlocked</span></div>
    <div class="profile-achievements-grid">${cards}</div>`;
}

/* ─────────────────────────────────────────
   BID HISTORY PANEL
───────────────────────────────────────── */
function buildBidsPanel() {
  const rows = MOCK_BID_HISTORY.map(b => {
    const resultLabel = b.result === 'won'     ? '<span class="profile-bid-row__won">✓ WON</span>'
                      : b.result === 'leading' ? '<span style="color:var(--green);font-family:var(--font-pixel);font-size:var(--px-xs)">↑ LEADING</span>'
                      : b.result === 'outbid'  ? '<span style="color:var(--red);font-family:var(--font-pixel);font-size:var(--px-xs);animation:blink 1s step-end infinite">⚠ OUTBID</span>'
                      : '<span class="profile-bid-row__lost">✗ LOST</span>';
    return `
      <div class="profile-bid-row">
        <span style="font-size:24px">${b.icon}</span>
        <div>
          <div class="profile-bid-row__city">${escapeHtml(b.city)}</div>
          <div style="font-size:var(--mono-sm);color:var(--text-dim)">${escapeHtml(b.region)} · Season ${b.season} · ${b.value}</div>
        </div>
        <div class="profile-bid-row__amount">🥇 ${formatNumber(b.myBid)}</div>
        ${resultLabel}
      </div>`;
  }).join('');

  return `
    <div class="section-title">CITY BID HISTORY</div>
    <div class="profile-bid-list">${rows}</div>`;
}
