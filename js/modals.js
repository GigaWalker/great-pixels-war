/* ============================================================
   MODALS.JS — The Great Pixels War
   Open/close all modals, overlay management, body scroll lock,
   mini-profile, item preview, confirm purchase, bid, alliance
   ============================================================ */
'use strict';

const modalState = { openModals:[], focusTrap:null };

function openModal(id) {
  const overlay = document.getElementById('modal-' + id);
  if (!overlay) { console.warn('[Modals] No modal:', id); return; }
  modalState.focusTrap = document.activeElement;
  modalState.openModals.push(id);
  overlay.classList.add('open');
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => {
    const f = overlay.querySelector('input:not([disabled]),button:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])');
    if (f) f.focus();
  });
}
window.openModal = openModal;

function closeModal(id) {
  const overlay = document.getElementById('modal-' + id);
  if (!overlay) return;
  overlay.classList.remove('open');
  modalState.openModals = modalState.openModals.filter(m => m !== id);
  if (modalState.openModals.length === 0) {
    document.body.classList.remove('modal-open');
    if (modalState.focusTrap) { try { modalState.focusTrap.focus(); } catch(e){} modalState.focusTrap = null; }
  }
}
window.closeModal = closeModal;

function closeAllModals() {
  document.querySelectorAll('.modal-overlay.open').forEach(o => o.classList.remove('open'));
  document.body.classList.remove('modal-open');
  modalState.openModals = [];
}
window.closeAllModals = closeAllModals;

function handleOverlayClick(e, id) {
  if (e.target === document.getElementById('modal-' + id)) closeModal(id);
}
window.handleOverlayClick = handleOverlayClick;

/* ── Mini Profile ── */
function openMiniProfile(username, avatar, rank, stats, vip) {
  const titleEl = document.getElementById('mini-profile-title');
  const bodyEl  = document.getElementById('modal-mini-profile-body');
  if (!bodyEl) return;
  if (titleEl) titleEl.textContent = username;
  const nameColor = vip === 'diamond' ? 'var(--diamond)' : vip === 'gold' ? 'var(--gold)' : 'var(--green)';
  const vipBadge  = vip === 'diamond' ? '<span style="color:var(--diamond)">💎</span>' : vip === 'gold' ? '<span style="color:var(--gold)">👑</span>' : '';
  bodyEl.innerHTML = `
    <div class="mini-profile__header">
      <div class="mini-profile__avatar">${avatar||'🪖'}</div>
      <div>
        <span class="mini-profile__name" style="color:${nameColor}">${escapeHtml(username)} ${vipBadge}</span>
        <span class="mini-profile__rank">${escapeHtml(rank||'Recruit')}</span>
      </div>
    </div>
    <div class="mini-profile__stats">
      <div class="mini-profile__stat"><span class="mini-profile__stat-val">${formatNumber(stats?.wins||0)}</span><span class="mini-profile__stat-key">WINS</span></div>
      <div class="mini-profile__stat"><span class="mini-profile__stat-val">${stats?.winRate||0}%</span><span class="mini-profile__stat-key">WIN RATE</span></div>
      <div class="mini-profile__stat"><span class="mini-profile__stat-val">${formatNumber(stats?.losses||0)}</span><span class="mini-profile__stat-key">LOSSES</span></div>
    </div>
    <div class="mini-profile__actions">
      <button class="btn btn--ghost btn--sm" onclick="closeModal('mini-profile')">CLOSE</button>
      <button class="btn btn--cyan btn--sm" onclick="startDM('${escapeHtml(username)}')">✉ MESSAGE</button>
      <button class="btn btn--yellow btn--sm" onclick="challengePlayer('${escapeHtml(username)}')">⚔ CHALLENGE</button>
    </div>`;
  openModal('mini-profile');
}
window.openMiniProfile = openMiniProfile;

function startDM(username) {
  closeModal('mini-profile');
  const o = document.getElementById('chatOverlay');
  if (o) o.classList.add('open');
  showToast('Opening DM with ' + username, 'info');
}
function challengePlayer(username) {
  closeModal('mini-profile');
  showToastFull('Challenge Sent','Waiting for ' + username + ' to accept...','war','⚔');
}
window.startDM         = startDM;
window.challengePlayer = challengePlayer;

/* ── Item Preview ── */
function openItemPreview(item) {
  const bodyEl  = document.getElementById('modal-item-preview-body');
  const titleEl = document.getElementById('item-preview-title');
  if (!bodyEl) return;
  if (titleEl) titleEl.textContent = item.name || 'ITEM PREVIEW';
  const colors  = { common:'var(--tier-common)', veteran:'var(--tier-veteran)', elite:'var(--tier-elite)', command:'var(--tier-command)' };
  const labels  = { common:'🥉 Bronze', veteran:'🥈 Silver', elite:'🥇 Gold', command:'💎 Diamonds' };
  const tier    = item.tier || 'common';
  bodyEl.innerHTML = `
    <div class="item-preview-hero">
      <span style="font-size:80px">${item.icon||'🎖'}</span>
      <div class="item-preview-hero__tier-bar" style="background:${colors[tier]}"></div>
    </div>
    <div class="item-preview-info">
      <span class="item-preview-info__tier" style="color:${colors[tier]}">${tier.toUpperCase()} TIER</span>
      <span class="item-preview-info__name">${escapeHtml(item.name||'')}</span>
      <p class="item-preview-info__desc">${escapeHtml(item.description||'No description available.')}</p>
      <div class="item-preview-info__meta">
        <div class="item-preview-meta-item"><span class="item-preview-meta-item__label">CATEGORY</span><span class="item-preview-meta-item__value">${escapeHtml(item.category||'Cosmetic')}</span></div>
        <div class="item-preview-meta-item"><span class="item-preview-meta-item__label">CURRENCY</span><span class="item-preview-meta-item__value">${labels[tier]}</span></div>
        <div class="item-preview-meta-item"><span class="item-preview-meta-item__label">PRICE</span><span class="item-preview-meta-item__value" style="color:${colors[tier]}">${formatNumber(item.price||0)}</span></div>
      </div>
    </div>`;
  const buyBtn = document.getElementById('item-preview-buy-btn');
  if (buyBtn) {
    if (item.owned) {
      buyBtn.textContent = item.equipped ? 'EQUIPPED' : 'EQUIP';
      buyBtn.className   = item.equipped ? 'btn btn--ghost' : 'btn btn--cyan';
      buyBtn.onclick     = () => { closeModal('item-preview'); if (!item.equipped) equipItem(item); };
    } else {
      buyBtn.textContent = 'BUY — ' + formatNumber(item.price||0);
      buyBtn.className   = 'btn btn--green';
      buyBtn.onclick     = () => { closeModal('item-preview'); openConfirmPurchase(item); };
    }
  }
  openModal('item-preview');
}
window.openItemPreview = openItemPreview;

/* ── Confirm Purchase ── */
function openConfirmPurchase(item) {
  const bodyEl = document.getElementById('modal-confirm-purchase-body');
  if (!bodyEl) return;
  const wKeys   = { common:'bronze', veteran:'silver', elite:'gold', command:'diamonds' };
  const colors  = { common:'var(--tier-common)', veteran:'var(--tier-veteran)', elite:'var(--tier-elite)', command:'var(--tier-command)' };
  const emojis  = { bronze:'🥉', silver:'🥈', gold:'🥇', diamonds:'💎' };
  const tier    = item.tier || 'common';
  const wKey    = wKeys[tier];
  const wallet  = window.GPW.mockUser?.wallet || {};
  const balance = wallet[wKey] || 0;
  const after   = Math.max(0, balance - (item.price||0));
  const canBuy  = balance >= (item.price||0);
  const emoji   = emojis[wKey] || '💎';
  bodyEl.innerHTML = `
    <div class="purchase-preview">
      <span class="purchase-preview__icon">${item.icon||'🎖'}</span>
      <div class="purchase-preview__info">
        <span class="purchase-preview__name">${escapeHtml(item.name||'')}</span>
        <span class="purchase-preview__tier" style="color:${colors[tier]}">${tier.toUpperCase()} TIER</span>
        <span class="purchase-preview__cost" style="color:${colors[tier]}">${emoji} ${formatNumber(item.price||0)}</span>
      </div>
    </div>
    <div class="purchase-balance"><span class="purchase-balance__label">YOUR BALANCE</span><span class="purchase-balance__amount" style="color:${colors[tier]}">${emoji} ${formatNumber(balance)}</span></div>
    <div class="purchase-balance"><span class="purchase-balance__after">AFTER PURCHASE</span><span class="purchase-balance__after-amount" style="color:${canBuy?'var(--green)':'var(--red)'}">${emoji} ${formatNumber(after)}</span></div>
    ${!canBuy ? '<div style="margin-top:var(--space-3);padding:var(--space-3) var(--space-4);background:rgba(255,58,58,0.08);border:1px solid var(--red);font-family:var(--font-pixel);font-size:var(--px-xs);color:var(--red);letter-spacing:1px">⚠ INSUFFICIENT FUNDS</div>' : ''}`;
  window._pendingPurchase = item;
  const btn = document.getElementById('confirm-purchase-btn');
  if (btn) { btn.disabled = !canBuy; btn.textContent = canBuy ? 'CONFIRM ▶' : 'INSUFFICIENT FUNDS'; }
  openModal('confirm-purchase');
}

function handlePurchaseComplete() {
  const item = window._pendingPurchase;
  if (!item) return;
  const wKeys  = { common:'bronze', veteran:'silver', elite:'gold', command:'diamonds' };
  const wallet = window.GPW.mockUser?.wallet;
  const wKey   = wKeys[item.tier || 'common'];
  if (wallet && wallet[wKey] !== undefined) {
    wallet[wKey] = Math.max(0, wallet[wKey] - (item.price||0));
    if (window.updateDropdownWallet) window.updateDropdownWallet();
  }
  item.owned = true;
  closeModal('confirm-purchase');
  window._pendingPurchase = null;
  showToastFull('PURCHASE COMPLETE', item.name + ' added to your collection!', 'reward', '🎁', 4000);
}
window.openConfirmPurchase    = openConfirmPurchase;
window.handlePurchaseComplete = handlePurchaseComplete;

function equipItem(item) { showToastFull('EQUIPPED', item.name + ' is now active!', 'success', '✅'); }
window.equipItem = equipItem;

/* ── Bid Modal ── */
function openBidModal(city) {
  const bodyEl = document.getElementById('modal-bid-body');
  if (!bodyEl) return;
  const gold = window.GPW.mockUser?.wallet?.gold || 0;
  bodyEl.innerHTML = `
    <div class="bid-modal-city">
      <span class="bid-modal-city__icon">${city.icon||'🏙'}</span>
      <div>
        <span class="bid-modal-city__name">${escapeHtml(city.name)}</span>
        <span class="bid-modal-city__region">${escapeHtml(city.region||'')}</span>
        <span class="bid-modal-city__value">Strategic Value: ${city.value||'High'}</span>
      </div>
    </div>
    <div class="bid-current"><span class="bid-current__label">CURRENT HIGH BID</span><span class="bid-current__amount">🥇 ${formatNumber(city.currentBid||0)}</span></div>
    <div class="form-group">
      <label class="form-label">YOUR BID</label>
      <div class="bid-input-wrap">
        <span class="bid-currency">🥇 GOLD</span>
        <input class="form-input" id="bidAmountInput" type="number" min="${(city.currentBid||0)+100}" max="${gold}" placeholder="${(city.currentBid||0)+100}">
        <button class="bid-max-btn" onclick="setMaxBid(${gold})">MAX</button>
      </div>
      <span class="form-hint">Your balance: 🥇 ${formatNumber(gold)} Gold</span>
    </div>`;
  window._pendingBidCity = city;
  openModal('bid');
}
function setMaxBid(max) { const i = document.getElementById('bidAmountInput'); if(i) i.value = max; }
function handleBidSubmit() {
  const input = document.getElementById('bidAmountInput');
  const city  = window._pendingBidCity;
  if (!input || !city) return closeModal('bid');
  const amount = parseInt(input.value, 10);
  const gold   = window.GPW.mockUser?.wallet?.gold || 0;
  if (!amount || amount <= (city.currentBid||0)) { showToast('Bid must exceed current bid', 'error'); return; }
  if (amount > gold) { showToast('Insufficient Gold', 'error'); return; }
  closeModal('bid');
  showToastFull('BID PLACED', 'You bid 🥇 ' + formatNumber(amount) + ' on ' + city.name, 'season', '🏙', 5000);
  window._pendingBidCity = null;
}
window.openBidModal    = openBidModal;
window.setMaxBid       = setMaxBid;
window.handleBidSubmit = handleBidSubmit;

/* ── Alliance Modal ── */
function openAllianceModal(data) {
  const titleEl = document.getElementById('alliance-modal-title');
  const bodyEl  = document.getElementById('modal-alliance-body');
  if (!bodyEl) return;
  if (titleEl) titleEl.textContent = '🤝 ' + (data?.name || 'ALLIANCE');
  if (!data) {
    bodyEl.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.5rem;padding:3rem 2rem;text-align:center">
        <span style="font-size:48px">🏴</span>
        <div style="font-family:var(--font-pixel);font-size:var(--px-sm);color:var(--text-dim)">NO ALLIANCE</div>
        <div style="font-size:var(--mono-md);color:var(--text-dim);max-width:320px">Join an alliance or create your own to fight in Season War.</div>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center">
          <button class="btn btn--green" onclick="closeModal('alliance');showToast('Coming soon!','info')">+ CREATE ALLIANCE</button>
          <button class="btn btn--cyan" onclick="closeModal('alliance');showToast('Coming soon!','info')">🔍 FIND ALLIANCE</button>
        </div>
      </div>`;
  } else {
    const members = data.members || [];
    bodyEl.innerHTML = `
      <div class="alliance-header">
        <div class="alliance-flag">${data.flag||'🏴'}</div>
        <div><span class="alliance-name">${escapeHtml(data.name)}</span><span class="alliance-tag">[${escapeHtml(data.tag||'')}] • Rank #${data.rank||'?'} • ${members.length} members</span></div>
      </div>
      <div style="padding:var(--space-4)">
        <div class="panel-title">MEMBERS</div>
        ${members.map(m=>`
          <div class="alliance-member" onclick="openMiniProfile('${escapeHtml(m.name)}','${m.avatar||'🪖'}','${m.rank||'Recruit'}',{wins:${m.wins||0},losses:${m.losses||0},winRate:${m.winRate||0}})">
            <div class="alliance-member__avatar">${m.avatar||'🪖'}</div>
            <span class="alliance-member__name">${escapeHtml(m.name)}</span>
            <span class="alliance-member__role alliance-member__role--${m.role||'member'}">${(m.role||'MEMBER').toUpperCase()}</span>
          </div>`).join('')}
      </div>`;
  }
  openModal('alliance');
}
window.openAllianceModal = openAllianceModal;

/* ── ESC closes top modal ── */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (modalState.openModals.length > 0) {
    closeModal(modalState.openModals[modalState.openModals.length - 1]);
    e.stopPropagation();
  }
});
