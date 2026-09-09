/* ============================================================
   SHOP.JS — The Great Pixels War
   Handles: tab switching, all panel renders (diamonds, VIP,
   units, buildings, profile, maps, bundles), item data,
   tier filters, category filters, wallet display
   Depends on: toast.js, modals.js, router.js
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   SHOP STATE
───────────────────────────────────────── */
const shopState = {
  tab:        'diamonds',
  unitCat:    'all',
  tierFilter: 'all'
};

/* ─────────────────────────────────────────
   ITEM DATA
───────────────────────────────────────── */
const DIAMOND_PACKS = [
  { id:'dp1', amount:100,   bonus:0,   price:'$1.99',  popular:false },
  { id:'dp2', amount:500,   bonus:50,  price:'$7.99',  popular:false },
  { id:'dp3', amount:1200,  bonus:200, price:'$14.99', popular:true  },
  { id:'dp4', amount:3000,  bonus:600, price:'$34.99', popular:false },
  { id:'dp5', amount:8000,  bonus:2000,price:'$79.99', popular:false },
  { id:'dp6', amount:20000, bonus:6000,price:'$179.99',popular:false }
];

const UNIT_SKINS = [
  { id:'u1',  name:'Desert Rifleman',     icon:'🪖', tier:'common',  category:'infantry', price:500,   description:'Sand-camo infantry skin for the Rifleman unit.',          owned:false, equipped:false },
  { id:'u2',  name:'Arctic Sergeant',     icon:'🎿', tier:'veteran', category:'infantry', price:2000,  description:'Snow-white camo for the Sergeant unit.',                  owned:false, equipped:false },
  { id:'u3',  name:'Urban Special Forces',icon:'🥷', tier:'elite',   category:'infantry', price:5000,  description:'Digital urban camo with gold rank patches.',              owned:false, equipped:false },
  { id:'u4',  name:'Black Ops Commander', icon:'👁', tier:'command', price:800,  description:'Classified black ops skin — animated beret insignia.',           owned:false, equipped:false, category:'infantry' },
  { id:'u5',  name:'Sand Raider Tank',    icon:'🚗', tier:'common',  category:'tank',     price:600,   description:'Desert camo wrap for the Light Tank.',                    owned:false, equipped:false },
  { id:'u6',  name:'Frost Titan',         icon:'❄', tier:'veteran', category:'tank',     price:2400,  description:'Arctic white armour for the Main Battle Tank.',           owned:false, equipped:false },
  { id:'u7',  name:'Ironclad MBT',        icon:'🛡', tier:'elite',   category:'tank',     price:6000,  description:'Polished black armour with gold barrel ring.',            owned:false, equipped:false },
  { id:'u8',  name:'Shadow Submarine',    icon:'🌊', tier:'veteran', category:'naval',    price:2200,  description:'Stealth matte finish for the Submarine.',                 owned:false, equipped:false },
  { id:'u9',  name:'Dreadnought Gold',    icon:'⚓', tier:'command', price:1000, description:'Command-tier Battleship skin — gold hull and animated flag.', owned:false, equipped:false, category:'naval' },
  { id:'u10', name:'Phantom Fighter',     icon:'✈', tier:'elite',   category:'air',      price:5500,  description:'Stealth-black fighter jet with neon blue exhaust trail.',  owned:false, equipped:false },
  { id:'u11', name:'Golden Drone',        icon:'🛸', tier:'command', price:900,  description:'Gold-finish drone with animated rotors.',                       owned:false, equipped:false, category:'air' },
  { id:'u12', name:'Rusty Patrol Boat',   icon:'🚤', tier:'common',  category:'naval',    price:400,   description:'Weathered veteran look for the Patrol Boat.',             owned:false, equipped:false }
];

const BUILDING_SKINS = [
  { id:'b1', name:'Desert Barracks',   icon:'🏜', tier:'common',  price:400,  description:'Sand-brick barracks skin.', owned:false, equipped:false },
  { id:'b2', name:'Stone Fortress',    icon:'🏰', tier:'veteran', price:1800, description:'Medieval-styled fortress skin for defensive structures.', owned:false, equipped:false },
  { id:'b3', name:'Modern Base',       icon:'🏗', tier:'elite',   price:4500, description:'Clean steel & glass military base aesthetic.', owned:false, equipped:false },
  { id:'b4', name:'Gilded Command HQ', icon:'🏛', tier:'command', price:1200, description:'Gold-trimmed animated Command HQ — visible to all players on map.', owned:false, equipped:false },
  { id:'b5', name:'Arctic Station',    icon:'❄', tier:'veteran', price:2000, description:'Snow-covered facility skin for cold-map deployments.', owned:false, equipped:false },
  { id:'b6', name:'Night Ops Airfield',icon:'🌙', tier:'elite',   price:5200, description:'Dark runway lights and black hangar skin.', owned:false, equipped:false }
];

const PROFILE_ITEMS = [
  { id:'p1', name:'Iron General Border',   icon:'🔲', tier:'common',  price:300,  description:'A battle-worn iron frame for your profile.', owned:false, equipped:false },
  { id:'p2', name:'Veteran Bronze Frame',  icon:'🥉', tier:'veteran', price:1500, description:'Bronze laurel wreath profile border.', owned:false, equipped:false },
  { id:'p3', name:'Elite Gold Frame',      icon:'🥇', tier:'elite',   price:4000, description:'Gold ornate profile border with rank insignia.', owned:false, equipped:false },
  { id:'p4', name:'Command Animated Frame',icon:'💎', tier:'command', price:700,  description:'Animated diamond-shimmer profile border — Diamond VIP exclusive.', owned:false, equipped:false },
  { id:'p5', name:'Custom Flag Slot',      icon:'🏴', tier:'veteran', price:1200, description:'Add a custom faction flag to your profile card.', owned:false, equipped:false },
  { id:'p6', name:'VIP Gold Chat Color',   icon:'✨', tier:'elite',   price:3000, description:'Your chat name appears in gold — Gold VIP or above.', owned:false, equipped:false },
  { id:'p7', name:'Title: Iron General',   icon:'🎖', tier:'common',  price:500,  description:'Display "Iron General" as your profile title.', owned:false, equipped:false },
  { id:'p8', name:'Title: Sea Wolf',       icon:'🐺', tier:'veteran', price:1800, description:'Display "Sea Wolf" — earned by naval campaign victories.', owned:false, equipped:false }
];

const MAP_THEMES = [
  { id:'m1', name:'Default Satellite',   icon:'🛰', tier:'common',  price:0,    description:'The standard pixel-art satellite map. Always free.', owned:true,  equipped:true  },
  { id:'m2', name:'Desert Warzone',      icon:'🏜', tier:'veteran', price:2000, description:'Sand and dust tones — all terrain shifts to desert palette.', owned:false, equipped:false },
  { id:'m3', name:'Arctic Conflict',     icon:'❄', tier:'elite',   price:5000, description:'Snow and ice world — coastlines frozen, cities iced.', owned:false, equipped:false },
  { id:'m4', name:'Night Operations',    icon:'🌙', tier:'elite',   price:5500, description:'Dark map with glowing city lights — looks incredible at scale.', owned:false, equipped:false },
  { id:'m5', name:'Classified',          icon:'📋', tier:'command', price:1500, description:'Black-and-white redacted map — only Command tier players can equip.', owned:false, equipped:false },
  { id:'m6', name:'Retro Paper Map',     icon:'🗺', tier:'veteran', price:2500, description:'Old-world paper texture — sepia tones and hand-drawn style borders.', owned:false, equipped:false }
];

const BUNDLES = [
  {
    id:'bun1', name:'Starter Pack',
    icons:'🪖🛡🗺',
    save:'Save 40%',
    items:['Desert Rifleman skin','Iron General border','Veteran Frame','2,000 Bronze'],
    originalPrice:'💎 2,500',
    price:'💎 1,500',
    action:'buy'
  },
  {
    id:'bun2', name:'Naval Commander',
    icons:'⚓🌊🐺',
    save:'Save 35%',
    items:['Shadow Submarine skin','Dreadnought Gold skin','Sea Wolf title','5,000 Silver'],
    originalPrice:'💎 4,200',
    price:'💎 2,700',
    action:'buy'
  },
  {
    id:'bun3', name:'Season 12 Bundle',
    icons:'🌍⚔🏆',
    save:'Save 50% — LIMITED',
    items:['Iron Tide map theme','Elite Gold Frame','Operation Iron Tide medal','10,000 Gold'],
    originalPrice:'💎 8,000',
    price:'💎 4,000',
    action:'buy',
    limited:true
  },
  {
    id:'bun4', name:'Air Force Pack',
    icons:'✈🛸🌙',
    save:'Save 30%',
    items:['Phantom Fighter skin','Golden Drone skin','Night Ops Airfield skin'],
    originalPrice:'💎 7,500',
    price:'💎 5,250',
    action:'buy'
  }
];

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
function initShop() {
  updateShopWallet();
  renderShopTab(shopState.tab);
}

registerPageHook('onEnter', 'shop', () => {
  initShop();
});

/* ─────────────────────────────────────────
   WALLET
───────────────────────────────────────── */
function updateShopWallet() {
  const wallet = window.GPW.isLoggedIn
    ? window.GPW.user?.wallet
    : window.GPW.mockUser?.wallet;
  if (!wallet) return;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = formatNumber(val); };
  set('shopDiamonds', wallet.diamonds);
  set('shopGold',     wallet.gold);
  set('shopSilver',   wallet.silver);
  set('shopBronze',   wallet.bronze);
}

/* ─────────────────────────────────────────
   TAB SWITCHING
───────────────────────────────────────── */
function setShopTab(btn, tab) {
  document.querySelectorAll('#shopTabGroup .tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
  btn.classList.add('tab-btn--active');
  shopState.tab        = tab;
  shopState.tierFilter = 'all';
  shopState.unitCat    = 'all';
  renderShopTab(tab);
}

window.setShopTab = setShopTab;

function renderShopTab(tab) {
  const content = document.getElementById('shopContent');
  if (!content) return;

  switch(tab) {
    case 'diamonds':  content.innerHTML = buildDiamondsTab();  break;
    case 'vip':       content.innerHTML = buildVipTab();       break;
    case 'units':     content.innerHTML = buildUnitsTab();     break;
    case 'buildings': content.innerHTML = buildItemsTab(BUILDING_SKINS, 'BUILDING SKINS'); break;
    case 'profile':   content.innerHTML = buildItemsTab(PROFILE_ITEMS,  'PROFILE ITEMS');  break;
    case 'maps':      content.innerHTML = buildItemsTab(MAP_THEMES,     'MAP THEMES');     break;
    case 'bundles':   content.innerHTML = buildBundlesTab();   break;
    default:          content.innerHTML = buildDiamondsTab();
  }
}

/* ─────────────────────────────────────────
   DIAMONDS TAB
───────────────────────────────────────── */
function buildDiamondsTab() {
  const packs = DIAMOND_PACKS.map(p => `
    <div class="diamond-pack ${p.popular ? 'diamond-pack--popular' : ''}"
      onclick="purchaseDiamondPack('${p.id}','${p.price}',${p.amount + p.bonus})">
      ${p.popular ? '<div class="diamond-pack__popular-tag">MOST POPULAR</div>' : ''}
      <span class="diamond-pack__icon">💎</span>
      <span class="diamond-pack__amount">${formatNumber(p.amount + p.bonus)}</span>
      ${p.bonus > 0 ? `<span class="diamond-pack__bonus">+${formatNumber(p.bonus)} BONUS</span>` : '<span style="height:20px;display:block"></span>'}
      <span class="diamond-pack__price">${p.price}</span>
      <button class="btn btn--diamond-solid btn--sm">BUY NOW</button>
    </div>`).join('');

  return `
    <div class="shop-section-title">💎 BUY DIAMONDS <span style="font-size:var(--mono-md);color:var(--text-muted);font-family:var(--font-mono)">Real money only · Secure checkout</span></div>
    <div class="shop-diamond-grid">${packs}</div>
    <div style="
      background:var(--bg3);border:1px solid var(--border);
      padding:var(--space-5);font-size:var(--mono-md);
      color:var(--text-dim);line-height:1.8;max-width:600px
    ">
      <div style="font-family:var(--font-pixel);font-size:var(--px-xs);color:var(--cyan);margin-bottom:var(--space-3);letter-spacing:1px">
        WHAT ARE DIAMONDS FOR?
      </div>
      💎 Diamonds are the premium currency. Use them to buy <span style="color:var(--tier-command)">Command tier</span> cosmetics,
      <span style="color:var(--vip-gold)">Gold VIP</span>, convert to Gold/Silver/Bronze, unlock exclusive bundles,
      and access season store items. You also earn a small amount of Diamonds from season rankings.
    </div>`;
}

function purchaseDiamondPack(id, price, amount) {
  requireAuth(() => {
    showToastFull('PURCHASE', `${price} → 💎 ${formatNumber(amount)} — Checkout coming soon!`, 'diamond', '💎', 5000);
  });
}

window.purchaseDiamondPack = purchaseDiamondPack;

/* ─────────────────────────────────────────
   VIP TAB
───────────────────────────────────────── */
function buildVipTab() {
  return `
    <div class="shop-section-title">👑 VIP MEMBERSHIP</div>
    <div class="shop-vip-grid">

      <div class="shop-vip-card shop-vip-card--gold">
        <div class="shop-vip-card__header">
          <span class="shop-vip-card__icon">👑</span>
          <span class="shop-vip-card__name">GOLD VIP</span>
          <span class="shop-vip-card__price" style="color:var(--gold)">💎 2,000 / month</span>
          <button class="btn btn--vip-gold btn--sm" onclick="purchaseVip('gold')">GET GOLD VIP</button>
        </div>
        <div class="shop-vip-card__perks">
          ${[
            ['👑','Gold username colour in chat and lobby'],
            ['+25%','Bonus on all season rewards'],
            ['🎨','Access to Gold VIP exclusive cosmetics'],
            ['🏙','Custom HQ building name on map'],
            ['📋','6 saved game templates (vs 3)'],
            ['🔒','Username reservation — no copycats'],
            ['📅','Priority city bid info in Season War'],
          ].map(([icon,text]) => `<div class="shop-vip-perk"><span class="shop-vip-perk__icon">${icon}</span><span>${text}</span></div>`).join('')}
        </div>
        <div class="shop-vip-card__footer">
          <button class="btn btn--vip-gold" style="width:100%" onclick="purchaseVip('gold')">SUBSCRIBE WITH 💎 DIAMONDS</button>
        </div>
      </div>

      <div class="shop-vip-card shop-vip-card--diamond">
        <div class="shop-vip-card__header">
          <span class="shop-vip-card__icon">💎</span>
          <span class="shop-vip-card__name">DIAMOND VIP</span>
          <span class="shop-vip-card__price" style="color:var(--diamond)">$9.99 / month</span>
          <button class="btn btn--vip-diamond btn--sm" onclick="purchaseVip('diamond')">GET DIAMOND VIP</button>
        </div>
        <div class="shop-vip-card__perks">
          ${[
            ['💎','Diamond blue username — stands out everywhere'],
            ['+50%','Bonus on ALL season rewards (highest tier)'],
            ['🎨','ALL Command cosmetics free while active'],
            ['🎁','Free monthly Diamond drop'],
            ['🔬','Early beta access to new maps and units'],
            ['👁','Spectate any private game'],
            ['📋','15 saved game templates'],
            ['🚀','Priority alliance invite system'],
            ['⭐','Includes all Gold VIP benefits'],
          ].map(([icon,text]) => `<div class="shop-vip-perk"><span class="shop-vip-perk__icon">${icon}</span><span>${text}</span></div>`).join('')}
        </div>
        <div class="shop-vip-card__footer">
          <button class="btn btn--vip-diamond" style="width:100%" onclick="purchaseVip('diamond')">SUBSCRIBE — REAL MONEY ONLY</button>
        </div>
      </div>

    </div>

    <div class="vip-table-wrap" style="overflow-x:auto">
      <table class="vip-table" style="min-width:500px">
        <thead>
          <tr>
            <th style="text-align:left">BENEFIT</th>
            <th class="vip-gold-col">GOLD VIP</th>
            <th class="vip-diamond-col">DIAMOND VIP</th>
          </tr>
        </thead>
        <tbody>
          ${[
            ['Season reward bonus','+25%','+50%'],
            ['Command cosmetics','❌','✅ Free while active'],
            ['Monthly diamond drop','❌','✅'],
            ['Beta access','❌','✅'],
            ['Spectate private games','❌','✅'],
            ['Saved game templates','6','15'],
            ['Chat name colour','Gold','Diamond blue'],
            ['Username reservation','✅','✅'],
            ['Custom HQ name','✅','✅'],
            ['Priority bid info','✅','✅'],
          ].map(([feat,gold,diamond]) => `
            <tr>
              <td>${feat}</td>
              <td class="vip-gold-col">${gold}</td>
              <td class="vip-diamond-col">${diamond}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function purchaseVip(tier) {
  requireAuth(() => {
    if (tier === 'diamond') {
      showToastFull('DIAMOND VIP', 'Real money checkout coming soon!', 'diamond', '💎', 5000);
    } else {
      const cost = 2000;
      const wallet = window.GPW.mockUser?.wallet;
      if (wallet && wallet.diamonds < cost) {
        showToast('Not enough Diamonds — need 💎 2,000', 'error');
        return;
      }
      showToastFull('GOLD VIP', 'Subscription with Diamonds coming soon!', 'info', '👑', 4000);
    }
  });
}

window.purchaseVip = purchaseVip;

/* ─────────────────────────────────────────
   UNITS TAB (with sub-category filter)
───────────────────────────────────────── */
function buildUnitsTab() {
  const cats = ['all','infantry','tank','naval','air'];
  const catLabels = { all:'ALL', infantry:'🪖 Infantry', tank:'🚗 Tanks', naval:'⚓ Naval', air:'✈ Air' };

  const catBtns = cats.map(c => `
    <button class="shop-unit-cat ${shopState.unitCat===c?'active':''}"
      onclick="setUnitCat('${c}')">${catLabels[c]}</button>`).join('');

  const filtered = UNIT_SKINS.filter(u =>
    (shopState.unitCat === 'all' || u.category === shopState.unitCat) &&
    (shopState.tierFilter === 'all' || u.tier === shopState.tierFilter)
  );

  return `
    <div class="shop-section-title">🪖 UNIT SKINS</div>
    <div class="shop-unit-cats">${catBtns}</div>
    ${buildTierFilter()}
    <div class="shop-items-grid">${filtered.map(buildItemCard).join('') || '<div style="color:var(--text-muted);padding:2rem">No items match filter.</div>'}</div>`;
}

function setUnitCat(cat) {
  shopState.unitCat = cat;
  renderShopTab('units');
}

window.setUnitCat = setUnitCat;

/* ─────────────────────────────────────────
   GENERIC ITEMS TAB
───────────────────────────────────────── */
function buildItemsTab(items, title) {
  const filtered = items.filter(i =>
    shopState.tierFilter === 'all' || i.tier === shopState.tierFilter
  );

  return `
    <div class="shop-section-title">${title}</div>
    ${buildTierFilter()}
    <div class="shop-items-grid">${filtered.map(buildItemCard).join('') || '<div style="color:var(--text-muted);padding:2rem">No items match filter.</div>'}</div>`;
}

/* ─────────────────────────────────────────
   TIER FILTER
───────────────────────────────────────── */
function buildTierFilter() {
  const tiers = [
    { key:'all',     label:'ALL TIERS',color:'var(--text-dim)' },
    { key:'common',  label:'COMMON',   color:'var(--tier-common)'  },
    { key:'veteran', label:'VETERAN',  color:'var(--tier-veteran)' },
    { key:'elite',   label:'ELITE',    color:'var(--tier-elite)'   },
    { key:'command', label:'COMMAND',  color:'var(--tier-command)' }
  ];

  return `
    <div class="shop-tier-filter">
      <span class="shop-tier-filter__label">TIER:</span>
      ${tiers.map(t => `
        <button class="filter-btn ${shopState.tierFilter===t.key?'filter-btn--active':''}"
          style="${shopState.tierFilter===t.key?`border-color:${t.color};color:${t.color}`:''}"
          onclick="setTierFilter('${t.key}')">${t.label}</button>`).join('')}
    </div>`;
}

function setTierFilter(tier) {
  shopState.tierFilter = tier;
  renderShopTab(shopState.tab);
}

window.setTierFilter = setTierFilter;

/* ─────────────────────────────────────────
   ITEM CARD BUILDER
───────────────────────────────────────── */
function buildItemCard(item) {
  const tierColors = { common:'var(--tier-common)', veteran:'var(--tier-veteran)', elite:'var(--tier-elite)', command:'var(--tier-command)' };
  const currencyEmoji = { common:'🥉', veteran:'🥈', elite:'🥇', command:'💎' };
  const color   = tierColors[item.tier] || 'var(--text-dim)';
  const emoji   = currencyEmoji[item.tier] || '💎';
  const isFree  = item.price === 0;

  let actionBtn = '';
  if (item.owned && item.equipped) {
    actionBtn = `<span class="shop-item__equipped-tag">EQUIPPED</span>`;
  } else if (item.owned) {
    actionBtn = `<button class="btn btn--cyan btn--xs" onclick="event.stopPropagation();equipShopItem('${item.id}')">EQUIP</button>`;
  } else if (isFree) {
    actionBtn = `<button class="btn btn--green btn--xs" onclick="event.stopPropagation();equipShopItem('${item.id}')">CLAIM FREE</button>`;
  } else {
    actionBtn = `<button class="btn btn--ghost btn--xs" onclick="event.stopPropagation();buyShopItem('${item.id}')">BUY</button>`;
  }

  return `
    <div class="shop-item ${item.owned?'owned':''} ${item.equipped?'equipped':''}"
      data-tier="${item.tier}"
      onclick="openItemPreview({id:'${item.id}',name:'${escapeHtml(item.name)}',icon:'${item.icon}',tier:'${item.tier}',description:'${escapeHtml(item.description||'')}',price:${item.price},owned:${item.owned},equipped:${item.equipped},category:'${item.category||'Cosmetic'}'})">
      ${item.tier === 'command' ? '<div class="shop-item__ribbon">💎 COMMAND</div>' : ''}
      <div class="shop-item__preview">
        <span style="font-size:48px;z-index:1">${item.icon}</span>
      </div>
      <div class="shop-item__body">
        <span class="shop-item__tier" style="color:${color}">${item.tier.toUpperCase()}</span>
        <div class="shop-item__name">${escapeHtml(item.name)}</div>
        <div class="shop-item__price">
          <span class="shop-item__cost" style="color:${color}">
            ${isFree ? 'FREE' : `${emoji} ${formatNumber(item.price)}`}
          </span>
          ${actionBtn}
        </div>
      </div>
    </div>`;
}

function buyShopItem(id) {
  const allItems = [...UNIT_SKINS, ...BUILDING_SKINS, ...PROFILE_ITEMS, ...MAP_THEMES];
  const item = allItems.find(i => i.id === id);
  if (item) {
    requireAuth(() => openConfirmPurchase(item));
  }
}

function equipShopItem(id) {
  const allItems = [...UNIT_SKINS, ...BUILDING_SKINS, ...PROFILE_ITEMS, ...MAP_THEMES];
  const item = allItems.find(i => i.id === id);
  if (item) {
    item.equipped = true;
    item.owned    = true;
    showToastFull('EQUIPPED', item.name + ' is now active!', 'success', '✅');
    renderShopTab(shopState.tab);
  }
}

window.buyShopItem  = buyShopItem;
window.equipShopItem = equipShopItem;

/* ─────────────────────────────────────────
   BUNDLES TAB
───────────────────────────────────────── */
function buildBundlesTab() {
  const cards = BUNDLES.map(b => `
    <div class="shop-bundle-card ${b.limited?'':''}">
      <div class="shop-bundle-card__header">
        <span class="shop-bundle-card__icons">${b.icons}</span>
        <div class="shop-bundle-card__info">
          <span class="shop-bundle-card__name">${escapeHtml(b.name)}</span>
          <span class="shop-bundle-card__save">${escapeHtml(b.save)}</span>
        </div>
      </div>
      <div class="shop-bundle-card__items">
        ${b.items.map(item => `<div class="shop-bundle-item"><span class="shop-bundle-item__icon">✓</span>${escapeHtml(item)}</div>`).join('')}
      </div>
      <div class="shop-bundle-card__footer">
        <div class="shop-bundle-card__price">
          <span class="shop-bundle-card__original">${b.originalPrice}</span>
          <span class="shop-bundle-card__discounted">${b.price}</span>
        </div>
        <button class="btn btn--diamond-solid btn--sm"
          onclick="requireAuth(()=>showToastFull('BUNDLE','${escapeHtml(b.name)} — checkout coming soon!','diamond','📦',4000))">
          BUY BUNDLE
        </button>
      </div>
    </div>`).join('');

  return `
    <div class="shop-section-title">📦 BUNDLES <span style="font-size:var(--mono-md);color:var(--text-muted);font-family:var(--font-mono)">Discounted item collections</span></div>
    <div class="shop-bundles-grid">${cards}</div>`;
}
