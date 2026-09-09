/* ============================================================
   CREATE-GAME.JS — The Great Pixels War
   Handles: create game modal content (multi-step),
   map tier & map picker, player/bot config, turn/duration
   inputs, fog/diplomacy/alliance toggles, win conditions,
   password field, form validation, submit flow
   Depends on: toast.js, modals.js, router.js
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
const createGameState = {
  step:       1,
  totalSteps: 3,
  mode:       'custom',  // custom | private | sandbox
  mapTier:    null,
  mapId:      null,
  config: {
    name:         '',
    maxPlayers:   8,
    botCount:     0,
    botDifficulty:'medium',
    turnDuration: 24,   // hours
    turnUnit:     'h',  // h | m
    fogOfWar:     true,
    diplomacy:    true,
    alliances:    true,
    winCondition: 'last-standing',
    startBronze:  5000,
    startSilver:  2000,
    startGold:    500,
    password:     ''
  }
};

/* ─────────────────────────────────────────
   MAP DATA
───────────────────────────────────────── */
const MAP_TIERS = {
  1: {
    name:  'Theater',
    range: '99 – 9,999 tiles',
    maps: [
      { id:'t1-1', name:'City District',    icon:'🏙', players:'2–4'  },
      { id:'t1-2', name:'Small Town',       icon:'🏘', players:'2–4'  },
      { id:'t1-3', name:'Battlefield Grid', icon:'⬛', players:'2–2'  }
    ]
  },
  2: {
    name:  'Regional',
    range: '10K – 999K tiles',
    maps: [
      { id:'t2-1', name:'Western Europe',   icon:'🗺', players:'2–12' },
      { id:'t2-2', name:'Middle East',      icon:'🏜', players:'2–8'  },
      { id:'t2-3', name:'Southeast Asia',   icon:'🌏', players:'2–12' },
      { id:'t2-4', name:'Custom Region',    icon:'✏', players:'2–12' }
    ]
  },
  3: {
    name:  'Continental',
    range: '1M – 99M tiles',
    maps: [
      { id:'t3-1', name:'Europe',           icon:'🗺', players:'2–50' },
      { id:'t3-2', name:'Asia',             icon:'🌏', players:'2–50' },
      { id:'t3-3', name:'North America',    icon:'🌎', players:'2–50' },
      { id:'t3-4', name:'Africa',           icon:'🌍', players:'2–50' }
    ]
  },
  4: {
    name:  'Global',
    range: '100M+ tiles',
    maps: [
      { id:'t4-1', name:'World Map',        icon:'🌍', players:'2–∞' },
      { id:'t4-2', name:'Alternate Earth',  icon:'🌐', players:'2–∞' }
    ]
  }
};

/* ─────────────────────────────────────────
   BUILD MODAL CONTENT
───────────────────────────────────────── */
function buildCreateGameModal(mode = 'custom') {
  const bodyEl = document.getElementById('modal-create-game-body');
  if (!bodyEl) return;

  createGameState.step = 1;
  createGameState.mode = mode;

  bodyEl.innerHTML = `
    <!-- Step indicator -->
    <div class="create-game-steps">
      ${['MAP & MODE','PLAYERS & BOTS','SETTINGS'].map((label, i) => `
        <div class="create-game-step ${i === 0 ? 'active' : ''}" id="cg-step-${i+1}">
          <div class="create-game-step__num">${i + 1}</div>
          ${label}
        </div>`).join('')}
    </div>

    <!-- Step panels -->
    <div id="cg-panel-1" class="create-game-panel active">${buildStep1()}</div>
    <div id="cg-panel-2" class="create-game-panel">${buildStep2()}</div>
    <div id="cg-panel-3" class="create-game-panel">${buildStep3()}</div>

    <!-- Footer buttons -->
    <div class="modal__footer modal__footer--between" id="cgFooter">
      <button class="btn btn--ghost" id="cgBackBtn" onclick="cgBack()" style="display:none">← BACK</button>
      <div style="display:flex;gap:var(--space-2);margin-left:auto">
        <button class="btn btn--ghost" onclick="closeModal('create-game')">CANCEL</button>
        <button class="btn btn--green" id="cgNextBtn" onclick="cgNext()">NEXT →</button>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────
   STEP 1: MAP TIER & MAP SELECTION
───────────────────────────────────────── */
function buildStep1() {
  const modeLabels = { custom:'Custom Game', private:'Private Game', sandbox:'Sandbox' };
  const modeLabel  = modeLabels[createGameState.mode] || 'Custom Game';

  return `
    <div style="padding:var(--space-5) var(--space-6)">

      <div class="form-group">
        <label class="form-label">GAME NAME</label>
        <input class="form-input" id="cg-name" type="text"
          placeholder="Operation ${randomCodename()}..."
          maxlength="40"
          value="${escapeHtml(createGameState.config.name)}">
        <span class="form-hint">This will be shown in the public lobby ${createGameState.mode === 'private' ? '(hidden — private game)' : ''}</span>
      </div>

      <div class="form-group">
        <label class="form-label">MODE</label>
        <div class="option-card-group" style="grid-template-columns:repeat(3,1fr)">
          ${['custom','private','sandbox'].map(m => `
            <div class="option-card ${createGameState.mode===m?'option-card--selected':''}"
              onclick="selectCGMode('${m}')">
              <span class="option-card__icon">${m==='custom'?'🎛':m==='private'?'🔒':'🤖'}</span>
              <span class="option-card__label">${m.toUpperCase()}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">SELECT MAP TIER</label>
        <div class="option-card-group" style="grid-template-columns:repeat(4,1fr)">
          ${[1,2,3,4].map(t => `
            <div class="option-card ${createGameState.mapTier===t?'option-card--selected':''}"
              onclick="selectCGTier(${t})">
              <span class="option-card__icon" style="font-size:18px">${['','I','II','III','IV'][t]}</span>
              <span class="option-card__label">${MAP_TIERS[t].name}</span>
              <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);display:block;margin-top:2px">${MAP_TIERS[t].range}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="form-group" id="cg-map-picker" style="${createGameState.mapTier ? '' : 'display:none'}">
        <label class="form-label">SELECT MAP</label>
        <div class="option-card-group" id="cg-map-options"></div>
      </div>

    </div>`;
}

/* ─────────────────────────────────────────
   STEP 2: PLAYERS & BOTS
───────────────────────────────────────── */
function buildStep2() {
  return `
    <div style="padding:var(--space-5) var(--space-6)">

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">MAX PLAYERS</label>
          <div class="number-input-wrap">
            <button class="number-btn" onclick="adjustCG('maxPlayers',-1)">−</button>
            <input class="form-input" id="cg-maxplayers" type="number"
              min="2" max="50" value="${createGameState.config.maxPlayers}"
              oninput="createGameState.config.maxPlayers=parseInt(this.value)||2">
            <button class="number-btn" onclick="adjustCG('maxPlayers',1)">+</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">BOT COUNT</label>
          <div class="number-input-wrap">
            <button class="number-btn" onclick="adjustCG('botCount',-1)">−</button>
            <input class="form-input" id="cg-botcount" type="number"
              min="0" max="49" value="${createGameState.config.botCount}"
              oninput="createGameState.config.botCount=parseInt(this.value)||0">
            <button class="number-btn" onclick="adjustCG('botCount',1)">+</button>
          </div>
          <span class="form-hint">Bots fill empty slots automatically</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">BOT DIFFICULTY</label>
        <div class="option-card-group" style="grid-template-columns:repeat(4,1fr)">
          ${['easy','medium','hard','brutal'].map(d => `
            <div class="option-card ${createGameState.config.botDifficulty===d?'option-card--selected':''}"
              onclick="selectCGBotDiff('${d}')">
              <span class="option-card__icon" style="font-size:18px">${d==='easy'?'😊':d==='medium'?'🤔':d==='hard'?'😤':'💀'}</span>
              <span class="option-card__label">${d.toUpperCase()}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">TURN DURATION</label>
          <div class="time-input-group">
            <div class="time-input-unit">
              <input class="form-input" id="cg-turnduration" type="number"
                min="1" max="999" value="${createGameState.config.turnDuration}"
                oninput="createGameState.config.turnDuration=parseInt(this.value)||1"
                style="width:80px;text-align:center">
            </div>
            <select class="form-select" id="cg-turnunit" style="width:100px"
              onchange="createGameState.config.turnUnit=this.value">
              <option value="m" ${createGameState.config.turnUnit==='m'?'selected':''}>Minutes</option>
              <option value="h" ${createGameState.config.turnUnit==='h'?'selected':''}>Hours</option>
              <option value="d">Days</option>
            </select>
          </div>
          <span class="form-hint">Default: 24 hours (1 minute for quick games)</span>
        </div>

        <div class="form-group">
          <label class="form-label">WIN CONDITION</label>
          <select class="form-select" id="cg-wincondition"
            onchange="createGameState.config.winCondition=this.value">
            <option value="last-standing" ${createGameState.config.winCondition==='last-standing'?'selected':''}>Last Player Standing</option>
            <option value="territory-50">Hold 50% Territory</option>
            <option value="territory-75">Hold 75% Territory</option>
            <option value="capital">Capture All Capitals</option>
            <option value="points">Points Threshold</option>
          </select>
        </div>
      </div>

    </div>`;
}

/* ─────────────────────────────────────────
   STEP 3: SETTINGS & RESOURCES
───────────────────────────────────────── */
function buildStep3() {
  const c = createGameState.config;
  return `
    <div style="padding:var(--space-5) var(--space-6)">

      <!-- Toggles -->
      <div class="form-section-title" style="font-family:var(--font-pixel);font-size:var(--px-xs);color:var(--cyan);letter-spacing:1px;margin-bottom:var(--space-4)">GAME OPTIONS</div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">FOG OF WAR</div>
          <div class="settings-row__desc">Players can only see tiles adjacent to their units</div>
        </div>
        <div class="settings-row__control">
          <div class="toggle ${c.fogOfWar?'on':''}" id="cg-fog"
            onclick="toggleCGOption('fogOfWar','cg-fog')"
            role="switch" aria-checked="${c.fogOfWar}" tabindex="0"></div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">DIPLOMACY</div>
          <div class="settings-row__desc">Players can form alliances, declare war, send peace offers</div>
        </div>
        <div class="settings-row__control">
          <div class="toggle ${c.diplomacy?'on':''}" id="cg-diplomacy"
            onclick="toggleCGOption('diplomacy','cg-diplomacy')"
            role="switch" aria-checked="${c.diplomacy}" tabindex="0"></div>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row__info">
          <div class="settings-row__label">ALLIANCES</div>
          <div class="settings-row__desc">Allow teams — players can join forces permanently</div>
        </div>
        <div class="settings-row__control">
          <div class="toggle ${c.alliances?'on':''}" id="cg-alliances"
            onclick="toggleCGOption('alliances','cg-alliances')"
            role="switch" aria-checked="${c.alliances}" tabindex="0"></div>
        </div>
      </div>

      <!-- Starting Resources -->
      <div class="form-section-title" style="font-family:var(--font-pixel);font-size:var(--px-xs);color:var(--cyan);letter-spacing:1px;margin:var(--space-5) 0 var(--space-4)">STARTING RESOURCES</div>

      <div class="resource-slider-group">
        <div class="resource-slider resource-slider--bronze">
          <div class="resource-slider__header">
            <span class="resource-slider__label">🥉 BRONZE</span>
            <span class="resource-slider__value" id="cg-bronze-val">${formatNumber(c.startBronze)}</span>
          </div>
          <input class="form-range" type="range" min="0" max="50000" step="500"
            value="${c.startBronze}"
            oninput="updateCGResource('startBronze','cg-bronze-val',this.value)">
        </div>
        <div class="resource-slider resource-slider--silver">
          <div class="resource-slider__header">
            <span class="resource-slider__label">🥈 SILVER</span>
            <span class="resource-slider__value" id="cg-silver-val">${formatNumber(c.startSilver)}</span>
          </div>
          <input class="form-range" type="range" min="0" max="20000" step="200"
            value="${c.startSilver}"
            oninput="updateCGResource('startSilver','cg-silver-val',this.value)">
        </div>
        <div class="resource-slider resource-slider--gold">
          <div class="resource-slider__header">
            <span class="resource-slider__label">🥇 GOLD</span>
            <span class="resource-slider__value" id="cg-gold-val">${formatNumber(c.startGold)}</span>
          </div>
          <input class="form-range" type="range" min="0" max="5000" step="50"
            value="${c.startGold}"
            oninput="updateCGResource('startGold','cg-gold-val',this.value)">
        </div>
      </div>

      <!-- Password (private only) -->
      ${createGameState.mode === 'private' ? `
        <div class="form-group" style="margin-top:var(--space-5)">
          <label class="form-label">PASSWORD <span class="optional">(optional)</span></label>
          <div class="password-wrap">
            <input class="form-input" id="cg-password" type="password"
              placeholder="Leave blank for invite-link only"
              maxlength="32"
              oninput="createGameState.config.password=this.value">
            <button class="password-toggle" type="button"
              onclick="togglePasswordVisibility('cg-password',this)">👁</button>
          </div>
        </div>` : ''}

      <!-- Summary -->
      <div style="
        margin-top:var(--space-5);
        background:var(--bg3);
        border:1px solid var(--border);
        padding:var(--space-4);
        font-size:var(--mono-md);
        color:var(--text-dim);
        line-height:1.8
      " id="cg-summary">
        <!-- Populated on step 3 render -->
      </div>

    </div>`;
}

/* ─────────────────────────────────────────
   STEP NAVIGATION
───────────────────────────────────────── */
function cgNext() {
  if (createGameState.step < createGameState.totalSteps) {
    // Validate current step
    if (createGameState.step === 1 && !validateStep1()) return;
    if (createGameState.step === 2 && !validateStep2()) return;

    // Save step 1 name
    if (createGameState.step === 1) {
      const nameEl = document.getElementById('cg-name');
      if (nameEl) createGameState.config.name = nameEl.value.trim();
    }

    // Advance
    goToStep(createGameState.step + 1);
  } else {
    // Submit
    submitCreateGame();
  }
}

function cgBack() {
  if (createGameState.step > 1) {
    goToStep(createGameState.step - 1);
  }
}

function goToStep(step) {
  // Hide current panel
  document.querySelectorAll('.create-game-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.create-game-step').forEach(s => s.classList.remove('active'));

  // Show target panel
  const panel = document.getElementById('cg-panel-' + step);
  const stepEl = document.getElementById('cg-step-' + step);
  if (panel)  panel.classList.add('active');
  if (stepEl) stepEl.classList.add('active');

  // Mark previous steps as done
  for (let i = 1; i < step; i++) {
    const s = document.getElementById('cg-step-' + i);
    if (s) s.classList.add('done');
  }

  createGameState.step = step;

  // Update footer buttons
  const backBtn = document.getElementById('cgBackBtn');
  const nextBtn = document.getElementById('cgNextBtn');
  if (backBtn) backBtn.style.display = step > 1 ? 'block' : 'none';
  if (nextBtn) nextBtn.textContent   = step === createGameState.totalSteps ? 'CREATE GAME ▶' : 'NEXT →';

  // On step 3, populate summary
  if (step === 3) populateCGSummary();
}

window.cgNext = cgNext;
window.cgBack = cgBack;

/* ─────────────────────────────────────────
   VALIDATION
───────────────────────────────────────── */
function validateStep1() {
  const nameEl = document.getElementById('cg-name');
  const name   = nameEl?.value.trim() || '';
  if (name.length < 3) {
    showToast('Game name must be at least 3 characters', 'error');
    if (nameEl) nameEl.classList.add('error');
    return false;
  }
  if (!createGameState.mapTier) {
    showToast('Please select a map tier', 'error');
    return false;
  }
  if (!createGameState.mapId) {
    showToast('Please select a map', 'error');
    return false;
  }
  return true;
}

function validateStep2() {
  const maxP = createGameState.config.maxPlayers;
  const bots = createGameState.config.botCount;
  if (maxP < 2) {
    showToast('Minimum 2 players', 'error');
    return false;
  }
  if (bots >= maxP) {
    showToast('Bot count must be less than max players', 'error');
    return false;
  }
  return true;
}

/* ─────────────────────────────────────────
   OPTION SELECTORS
───────────────────────────────────────── */
function selectCGMode(mode) {
  createGameState.mode = mode;
  // Re-render step 1 (changes password visibility on step 3)
  const panel = document.getElementById('cg-panel-1');
  if (panel) panel.innerHTML = buildStep1();
  // Rebuild step 3 for password field
  const p3 = document.getElementById('cg-panel-3');
  if (p3) p3.innerHTML = buildStep3();
}

function selectCGTier(tier) {
  createGameState.mapTier = tier;
  createGameState.mapId   = null;

  // Update tier cards
  document.querySelectorAll('#cg-panel-1 .option-card').forEach((c, i) => {
    // Only update tier cards (first 4 option cards)
    if (i < 4) c.classList.remove('option-card--selected');
  });
  event.currentTarget?.classList.add('option-card--selected');

  // Show map picker
  const picker = document.getElementById('cg-map-picker');
  const opts   = document.getElementById('cg-map-options');
  if (picker) picker.style.display = 'block';
  if (opts && MAP_TIERS[tier]) {
    opts.innerHTML = MAP_TIERS[tier].maps.map(m => `
      <div class="option-card" onclick="selectCGMap('${m.id}',this)">
        <span class="option-card__icon">${m.icon}</span>
        <span class="option-card__label">${m.name}</span>
        <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);display:block">${m.players}</span>
      </div>`).join('');
  }
}

function selectCGMap(id, el) {
  createGameState.mapId = id;
  document.querySelectorAll('#cg-map-options .option-card').forEach(c => c.classList.remove('option-card--selected'));
  if (el) el.classList.add('option-card--selected');
}

function selectCGBotDiff(diff) {
  createGameState.config.botDifficulty = diff;
  document.querySelectorAll('#cg-panel-2 .option-card').forEach(c => c.classList.remove('option-card--selected'));
  event.currentTarget?.classList.add('option-card--selected');
}

function adjustCG(key, delta) {
  const limits = { maxPlayers:[2,50], botCount:[0,49] };
  const [min,max] = limits[key] || [0,999];
  const current   = createGameState.config[key] || 0;
  const next      = Math.max(min, Math.min(max, current + delta));
  createGameState.config[key] = next;
  const inputId = key === 'maxPlayers' ? 'cg-maxplayers' : 'cg-botcount';
  const el = document.getElementById(inputId);
  if (el) el.value = next;
}

function toggleCGOption(key, elId) {
  createGameState.config[key] = !createGameState.config[key];
  const el = document.getElementById(elId);
  if (el) {
    el.classList.toggle('on', createGameState.config[key]);
    el.setAttribute('aria-checked', createGameState.config[key]);
  }
}

function updateCGResource(key, valId, val) {
  createGameState.config[key] = parseInt(val) || 0;
  const el = document.getElementById(valId);
  if (el) el.textContent = formatNumber(createGameState.config[key]);
}

window.selectCGMode    = selectCGMode;
window.selectCGTier    = selectCGTier;
window.selectCGMap     = selectCGMap;
window.selectCGBotDiff = selectCGBotDiff;
window.adjustCG        = adjustCG;
window.toggleCGOption  = toggleCGOption;
window.updateCGResource = updateCGResource;

/* ─────────────────────────────────────────
   SUMMARY (step 3)
───────────────────────────────────────── */
function populateCGSummary() {
  const el  = document.getElementById('cg-summary');
  if (!el) return;

  const c    = createGameState.config;
  const tier = MAP_TIERS[createGameState.mapTier];
  const mapName = tier?.maps.find(m => m.id === createGameState.mapId)?.name || '—';

  el.innerHTML = `
    <div style="font-family:var(--font-pixel);font-size:var(--px-xs);color:var(--cyan);letter-spacing:1px;margin-bottom:var(--space-3)">GAME SUMMARY</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)">
      <div><span style="color:var(--text-muted)">Name:</span> ${escapeHtml(createGameState.config.name||'Unnamed')}</div>
      <div><span style="color:var(--text-muted)">Mode:</span> ${createGameState.mode.toUpperCase()}</div>
      <div><span style="color:var(--text-muted)">Map:</span> ${escapeHtml(mapName)}</div>
      <div><span style="color:var(--text-muted)">Tier:</span> ${tier?.name||'—'}</div>
      <div><span style="color:var(--text-muted)">Players:</span> ${c.maxPlayers} (+ ${c.botCount} bots)</div>
      <div><span style="color:var(--text-muted)">Bot level:</span> ${c.botDifficulty.toUpperCase()}</div>
      <div><span style="color:var(--text-muted)">Turn:</span> ${c.turnDuration}${c.turnUnit}</div>
      <div><span style="color:var(--text-muted)">Win:</span> ${c.winCondition.replace(/-/g,' ')}</div>
      <div><span style="color:var(--text-muted)">Fog:</span> ${c.fogOfWar?'ON':'OFF'}</div>
      <div><span style="color:var(--text-muted)">Diplomacy:</span> ${c.diplomacy?'ON':'OFF'}</div>
    </div>`;
}

/* ─────────────────────────────────────────
   SUBMIT
───────────────────────────────────────── */
function submitCreateGame() {
  const c = createGameState.config;

  closeModal('create-game');

  showToastFull(
    'GAME CREATED!',
    `"${c.name || 'New Game'}" — waiting for players`,
    'success', '⚔', 5000
  );

  // Navigate to lobby
  navigate('lobby');
}

/* ─────────────────────────────────────────
   UTILITY
───────────────────────────────────────── */
function randomCodename() {
  const adjectives = ['Iron','Steel','Ghost','Phantom','Arctic','Desert','Shadow','Neon','Silent','Thunder'];
  const nouns      = ['Dawn','Strike','Veil','Tide','Storm','Siege','Pact','Hawk','Wolf','Shield'];
  const a = adjectives[Math.floor(Math.random() * adjectives.length)];
  const n = nouns[Math.floor(Math.random() * nouns.length)];
  return `${a} ${n}`;
}

/* ─────────────────────────────────────────
   BOOT — override openModal for create-game
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const _orig = window.openModal;
  window.openModal = function(id) {
    if (id === 'create-game') {
      const body = document.getElementById('modal-create-game-body');
      if (body) buildCreateGameModal(createGameState.mode);
    }
    _orig(id);
  };
});
