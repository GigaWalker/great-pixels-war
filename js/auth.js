/* ============================================================
   AUTH.JS — The Great Pixels War
   Handles: auth modal content, login form, register form,
   form validation, mock login/register flow, logout,
   password show/hide, remember me, auth state updates
   Depends on: toast.js, modals.js, navbar.js
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   MOCK USER DATABASE
   Replace with real API calls in production
───────────────────────────────────────── */
const MOCK_USERS = [
  {
    id:       'usr_001',
    username: 'GHOST_RECON',
    email:    'ghost@warfront.com',
    password: 'password123',
    avatar:   '🪖',
    flag:     '🏴',
    title:    'Iron Veteran',
    rank:     'Sergeant II',
    xp:       3820,
    xpNext:   6000,
    vip:      null,
    wallet:   { diamonds:1240, gold:8400, silver:22100, bronze:105300 },
    stats:    { wins:148, losses:62, winRate:70, turns:4820, cities:312, units:9841 },
    alliance: null
  },
  {
    id:       'usr_002',
    username: 'IRONWOLF',
    email:    'iron@warfront.com',
    password: 'password123',
    avatar:   '🐺',
    flag:     '🇩🇪',
    title:    'Supreme Conqueror',
    rank:     'General',
    xp:       175300,
    xpNext:   250000,
    vip:      'diamond',
    wallet:   { diamonds:8800, gold:42000, silver:180000, bronze:900000 },
    stats:    { wins:2560, losses:600, winRate:81, turns:88400, cities:9800, units:420000 },
    alliance: { name:'Iron Pact', tag:'IP', flag:'⚔', rank:2, members:[] }
  }
];


/* ─────────────────────────────────────────
   BUILD AUTH MODAL CONTENT
   Called when modal is opened
───────────────────────────────────────── */
function buildAuthModal(defaultTab = 'login') {
  const bodyEl = document.getElementById('modal-auth-body');
  if (!bodyEl) return;

  bodyEl.innerHTML = `
    <!-- Auth tabs -->
    <div class="auth-tabs">
      <button class="auth-tab ${defaultTab === 'login' ? 'active' : ''}"
        id="tab-login"
        onclick="switchAuth('login')"
        aria-selected="${defaultTab === 'login'}">
        LOG IN
      </button>
      <button class="auth-tab ${defaultTab === 'register' ? 'active' : ''}"
        id="tab-register"
        onclick="switchAuth('register')"
        aria-selected="${defaultTab === 'register'}">
        REGISTER
      </button>
    </div>

    <!-- LOGIN FORM -->
    <div class="auth-form ${defaultTab === 'login' ? 'active' : ''}" id="form-login">
      <div class="form-group">
        <label class="form-label" for="login-username">USERNAME OR EMAIL</label>
        <input
          class="form-input"
          id="login-username"
          type="text"
          placeholder="your_callsign"
          autocomplete="username"
          maxlength="32"
        >
        <span class="form-error" id="login-username-err"></span>
      </div>

      <div class="form-group">
        <label class="form-label" for="login-password">PASSWORD</label>
        <div class="password-wrap">
          <input
            class="form-input"
            id="login-password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
          >
          <button
            class="password-toggle"
            type="button"
            onclick="togglePasswordVisibility('login-password', this)"
            aria-label="Show/hide password"
          >👁</button>
        </div>
        <span class="form-error" id="login-password-err"></span>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-5)">
        <label class="checkbox-wrap">
          <input class="form-checkbox" id="login-remember" type="checkbox">
          <span class="checkbox-label">Remember me</span>
        </label>
        <a href="#"
          style="font-family:var(--font-pixel);font-size:var(--px-xs);color:var(--text-dim);letter-spacing:1px"
          onclick="showForgotPassword(); return false;">
          FORGOT?
        </a>
      </div>

      <div class="form-footer form-footer--between">
        <button class="btn btn--ghost" onclick="closeModal('auth')">CANCEL</button>
        <button class="btn btn--green" onclick="handleLogin()">LOG IN ▶</button>
      </div>

      <div class="auth-footer-link">
        No account?
        <a onclick="switchAuth('register')">Register here</a>
      </div>

      <!-- Demo hint -->
      <div style="
        margin-top:var(--space-5);
        padding:var(--space-3) var(--space-4);
        background:var(--bg3);
        border:1px solid var(--border);
        font-size:var(--mono-sm);
        color:var(--text-muted);
        line-height:1.6;
      ">
        <span style="color:var(--cyan);font-family:var(--font-pixel);font-size:5px;letter-spacing:1px">DEMO LOGIN</span><br>
        Username: <span style="color:var(--text)">GHOST_RECON</span><br>
        Password: <span style="color:var(--text)">password123</span>
      </div>
    </div>

    <!-- REGISTER FORM -->
    <div class="auth-form ${defaultTab === 'register' ? 'active' : ''}" id="form-register">
      <div class="form-group">
        <label class="form-label" for="reg-username">
          CALLSIGN / USERNAME <span class="required">*</span>
        </label>
        <input
          class="form-input"
          id="reg-username"
          type="text"
          placeholder="GHOST_RECON"
          autocomplete="username"
          maxlength="20"
          oninput="checkUsernameAvailability(this.value)"
        >
        <span class="form-error"   id="reg-username-err"></span>
        <span class="form-success" id="reg-username-ok" style="display:none">✓ Available</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="reg-email">
          EMAIL <span class="required">*</span>
        </label>
        <input
          class="form-input"
          id="reg-email"
          type="email"
          placeholder="you@warfront.com"
          autocomplete="email"
        >
        <span class="form-error" id="reg-email-err"></span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="reg-password">
            PASSWORD <span class="required">*</span>
          </label>
          <div class="password-wrap">
            <input
              class="form-input"
              id="reg-password"
              type="password"
              placeholder="Min 8 characters"
              autocomplete="new-password"
              oninput="checkPasswordStrength(this.value)"
            >
            <button
              class="password-toggle"
              type="button"
              onclick="togglePasswordVisibility('reg-password', this)"
              aria-label="Show/hide password">👁</button>
          </div>
          <!-- Password strength bar -->
          <div id="pw-strength-wrap" style="margin-top:var(--space-2);display:none">
            <div style="background:var(--bg);border:1px solid var(--border);height:4px;margin-bottom:4px">
              <div id="pw-strength-bar" style="height:100%;width:0%;transition:width 0.3s,background 0.3s"></div>
            </div>
            <span id="pw-strength-label" style="font-family:var(--font-pixel);font-size:5px;letter-spacing:1px"></span>
          </div>
          <span class="form-error" id="reg-password-err"></span>
        </div>

        <div class="form-group">
          <label class="form-label" for="reg-confirm">
            CONFIRM PASSWORD <span class="required">*</span>
          </label>
          <div class="password-wrap">
            <input
              class="form-input"
              id="reg-confirm"
              type="password"
              placeholder="Repeat password"
              autocomplete="new-password"
            >
            <button
              class="password-toggle"
              type="button"
              onclick="togglePasswordVisibility('reg-confirm', this)"
              aria-label="Show/hide password">👁</button>
          </div>
          <span class="form-error" id="reg-confirm-err"></span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">PICK YOUR STARTING AVATAR</label>
        <div class="option-card-group" id="avatarPicker" style="grid-template-columns:repeat(6,1fr)">
          ${['🪖','🦅','🐺','🐉','🔱','⚡','🎯','🛡','🗡','🏴','👁','☠'].map((emoji, i) => `
            <div class="option-card ${i === 0 ? 'option-card--selected' : ''}"
              onclick="selectAvatar(this, '${emoji}')"
              data-avatar="${emoji}">
              <span class="option-card__icon" style="font-size:22px">${emoji}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="checkbox-wrap">
          <input class="form-checkbox" id="reg-terms" type="checkbox">
          <span class="checkbox-label">
            I agree to the <a href="#" style="color:var(--green)" onclick="return false">Terms of Service</a>
            and <a href="#" style="color:var(--green)" onclick="return false">Privacy Policy</a>
          </span>
        </label>
        <span class="form-error" id="reg-terms-err"></span>
      </div>

      <div class="form-footer form-footer--between">
        <button class="btn btn--ghost" onclick="closeModal('auth')">CANCEL</button>
        <button class="btn btn--green" onclick="handleRegister()">JOIN THE WAR ▶</button>
      </div>

      <div class="auth-footer-link">
        Already have an account?
        <a onclick="switchAuth('login')">Log in</a>
      </div>
    </div>
  `;
}


/* ─────────────────────────────────────────
   SWITCH AUTH TAB
───────────────────────────────────────── */
function switchAuth(tab) {
  // Build modal content if not already built
  const body = document.getElementById('modal-auth-body');
  if (!body || !body.innerHTML.trim()) {
    buildAuthModal(tab);
    return;
  }

  const loginTab    = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const loginForm   = document.getElementById('form-login');
  const registerForm= document.getElementById('form-register');

  const isLogin = tab === 'login';

  if (loginTab)    { loginTab.classList.toggle('active', isLogin);  loginTab.setAttribute('aria-selected', isLogin); }
  if (registerTab) { registerTab.classList.toggle('active', !isLogin); registerTab.setAttribute('aria-selected', !isLogin); }
  if (loginForm)    loginForm.classList.toggle('active', isLogin);
  if (registerForm) registerForm.classList.toggle('active', !isLogin);

  // Clear errors
  clearAuthErrors();
}

window.switchAuth = switchAuth;


/* ─────────────────────────────────────────
   HANDLE LOGIN
───────────────────────────────────────── */
function handleLogin() {
  clearAuthErrors();

  const username = document.getElementById('login-username')?.value.trim() || '';
  const password = document.getElementById('login-password')?.value || '';
  let   valid    = true;

  // Validate
  if (!username) {
    setFieldError('login-username', 'Enter your username or email');
    valid = false;
  }
  if (!password) {
    setFieldError('login-password', 'Enter your password');
    valid = false;
  }
  if (!valid) return;

  // Mock lookup
  const user = MOCK_USERS.find(u =>
    u.username.toLowerCase() === username.toLowerCase() ||
    u.email.toLowerCase()    === username.toLowerCase()
  );

  if (!user || user.password !== password) {
    setFieldError('login-username', 'Invalid username or password');
    setFieldError('login-password', 'Invalid username or password');
    showToast('Login failed — check your credentials', 'error');
    return;
  }

  // Success — log in
  completeLogin(user);
}

window.handleLogin = handleLogin;


/* ─────────────────────────────────────────
   HANDLE REGISTER
───────────────────────────────────────── */
function handleRegister() {
  clearAuthErrors();

  const username = document.getElementById('reg-username')?.value.trim()  || '';
  const email    = document.getElementById('reg-email')?.value.trim()     || '';
  const password = document.getElementById('reg-password')?.value         || '';
  const confirm  = document.getElementById('reg-confirm')?.value          || '';
  const terms    = document.getElementById('reg-terms')?.checked          || false;
  const avatar   = window._selectedAvatar || '🪖';
  let   valid    = true;

  // Validate username
  if (!username) {
    setFieldError('reg-username', 'Enter a username'); valid = false;
  } else if (username.length < 3) {
    setFieldError('reg-username', 'Min 3 characters'); valid = false;
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    setFieldError('reg-username', 'Letters, numbers, underscores only'); valid = false;
  } else if (MOCK_USERS.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    setFieldError('reg-username', 'Username already taken'); valid = false;
  }

  // Validate email
  if (!email) {
    setFieldError('reg-email', 'Enter your email'); valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('reg-email', 'Enter a valid email address'); valid = false;
  }

  // Validate password
  if (!password) {
    setFieldError('reg-password', 'Enter a password'); valid = false;
  } else if (password.length < 8) {
    setFieldError('reg-password', 'Min 8 characters'); valid = false;
  }

  // Validate confirm
  if (!confirm) {
    setFieldError('reg-confirm', 'Confirm your password'); valid = false;
  } else if (password !== confirm) {
    setFieldError('reg-confirm', 'Passwords do not match'); valid = false;
  }

  // Validate terms
  if (!terms) {
    setFieldError('reg-terms', 'You must accept the terms'); valid = false;
  }

  if (!valid) return;

  // Create mock user
  const newUser = {
    id:       'usr_' + Date.now(),
    username: username.toUpperCase(),
    email,
    password,
    avatar,
    flag:     '🏴',
    title:    'Raw Recruit',
    rank:     'Recruit',
    xp:       0,
    xpNext:   500,
    vip:      null,
    wallet:   { diamonds:0, gold:500, silver:2000, bronze:10000 },
    stats:    { wins:0, losses:0, winRate:0, turns:0, cities:0, units:0 },
    alliance: null
  };

  MOCK_USERS.push(newUser);
  completeLogin(newUser);
  showToastFull(
    'WELCOME TO THE WAR',
    'Your account has been created, ' + newUser.username + '!',
    'success', '🪖', 5000
  );
}

window.handleRegister = handleRegister;


/* ─────────────────────────────────────────
   COMPLETE LOGIN
───────────────────────────────────────── */
function completeLogin(user) {
  // Set global state
  window.GPW.isLoggedIn = true;
  window.GPW.user       = user;

  // Persist to sessionStorage (mock — use real tokens in prod)
  try {
    sessionStorage.setItem('gpw_user_id', user.id);
  } catch(e) {}

  // Close modal
  closeModal('auth');

  // Update navbar
  if (window.updateNavAuth) window.updateNavAuth();

  // Fire login toast (only for returning users, not new registrations)
  if (!window._justRegistered) {
    showToastFull(
      'WELCOME BACK',
      user.username + ' — Ready for war?',
      'success', user.avatar, 4000
    );
  }
  window._justRegistered = false;

  // Fire any pending post-login actions
  if (window._postLoginAction) {
    try { window._postLoginAction(); } catch(e) {}
    window._postLoginAction = null;
  }
}

window.completeLogin = completeLogin;


/* ─────────────────────────────────────────
   REQUIRE AUTH
   Call this to gate any action behind login
   requireAuth(() => openModal('create-game'))
───────────────────────────────────────── */
function requireAuth(fn) {
  if (window.GPW.isLoggedIn) {
    fn();
  } else {
    window._postLoginAction = fn;
    openModal('auth');
    switchAuth('login');
    showToast('Please log in to continue', 'info', '🔒');
  }
}

window.requireAuth = requireAuth;


/* ─────────────────────────────────────────
   FORGOT PASSWORD (mock)
───────────────────────────────────────── */
function showForgotPassword() {
  showToastFull(
    'FORGOT PASSWORD',
    'Password reset is not implemented in demo mode.',
    'info', '📧', 5000
  );
}

window.showForgotPassword = showForgotPassword;


/* ─────────────────────────────────────────
   PASSWORD VISIBILITY TOGGLE
───────────────────────────────────────── */
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isPassword = input.type === 'password';
  input.type       = isPassword ? 'text' : 'password';
  btn.textContent  = isPassword ? '🙈' : '👁';
  btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
}

window.togglePasswordVisibility = togglePasswordVisibility;


/* ─────────────────────────────────────────
   PASSWORD STRENGTH CHECKER
───────────────────────────────────────── */
function checkPasswordStrength(password) {
  const wrap  = document.getElementById('pw-strength-wrap');
  const bar   = document.getElementById('pw-strength-bar');
  const label = document.getElementById('pw-strength-label');
  if (!wrap || !bar || !label) return;

  if (!password) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';

  let score = 0;
  if (password.length >= 8)                    score++;
  if (password.length >= 12)                   score++;
  if (/[A-Z]/.test(password))                 score++;
  if (/[0-9]/.test(password))                 score++;
  if (/[^A-Za-z0-9]/.test(password))          score++;

  const levels = [
    { pct:20,  color:'var(--red)',    text:'WEAK',      labelColor:'var(--red)'    },
    { pct:40,  color:'var(--red)',    text:'WEAK',      labelColor:'var(--red)'    },
    { pct:60,  color:'var(--yellow)', text:'FAIR',      labelColor:'var(--yellow)' },
    { pct:80,  color:'var(--yellow)', text:'GOOD',      labelColor:'var(--yellow)' },
    { pct:100, color:'var(--green)',  text:'STRONG',    labelColor:'var(--green)'  }
  ];

  const level = levels[Math.min(score, 4)];
  bar.style.width      = level.pct + '%';
  bar.style.background = level.color;
  label.textContent    = level.text;
  label.style.color    = level.labelColor;
}

window.checkPasswordStrength = checkPasswordStrength;


/* ─────────────────────────────────────────
   USERNAME AVAILABILITY CHECK (mock)
───────────────────────────────────────── */
let _usernameCheckTimer = null;

function checkUsernameAvailability(username) {
  clearTimeout(_usernameCheckTimer);

  const errEl = document.getElementById('reg-username-err');
  const okEl  = document.getElementById('reg-username-ok');

  if (!username || username.length < 3) {
    if (okEl) okEl.style.display = 'none';
    return;
  }

  _usernameCheckTimer = setTimeout(() => {
    const taken = MOCK_USERS.some(
      u => u.username.toLowerCase() === username.toLowerCase()
    );

    if (taken) {
      if (errEl) { errEl.textContent = 'Username already taken'; errEl.classList.add('visible'); }
      if (okEl)  okEl.style.display = 'none';
    } else {
      if (errEl) errEl.classList.remove('visible');
      if (okEl)  okEl.style.display = 'block';
    }
  }, 400);
}

window.checkUsernameAvailability = checkUsernameAvailability;


/* ─────────────────────────────────────────
   AVATAR PICKER
───────────────────────────────────────── */
window._selectedAvatar = '🪖';

function selectAvatar(card, emoji) {
  document.querySelectorAll('#avatarPicker .option-card').forEach(c => {
    c.classList.remove('option-card--selected');
  });
  card.classList.add('option-card--selected');
  window._selectedAvatar = emoji;
}

window.selectAvatar = selectAvatar;


/* ─────────────────────────────────────────
   FORM ERROR HELPERS
───────────────────────────────────────── */
function setFieldError(fieldId, message) {
  const errEl   = document.getElementById(fieldId + '-err');
  const inputEl = document.getElementById(fieldId);

  if (errEl)   { errEl.textContent = message; errEl.classList.add('visible'); }
  if (inputEl)   inputEl.classList.add('error');
}

function clearAuthErrors() {
  document.querySelectorAll('.auth-form .form-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });
  document.querySelectorAll('.auth-form .form-input').forEach(el => {
    el.classList.remove('error');
  });
  const okEl = document.getElementById('reg-username-ok');
  if (okEl) okEl.style.display = 'none';
}

window.setFieldError  = setFieldError;
window.clearAuthErrors = clearAuthErrors;


/* ─────────────────────────────────────────
   BOOT — Build modal content when opened
   Hook into the auth modal open event
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Override openModal for auth to build content first
  const _originalOpen = window.openModal;
  window.openModal = function(id) {
    if (id === 'auth') {
      const body = document.getElementById('modal-auth-body');
      if (body && !body.innerHTML.trim()) {
        buildAuthModal('login');
      }
    }
    _originalOpen(id);
  };

  // Restore session if persisted
  try {
    const savedId = sessionStorage.getItem('gpw_user_id');
    if (savedId) {
      const user = MOCK_USERS.find(u => u.id === savedId);
      if (user) {
        window.GPW.isLoggedIn = true;
        window.GPW.user       = user;
      }
    }
  } catch(e) {}
});
