/* ============================================================
   CHAT.JS — The Great Pixels War
   Handles: world chat, alliance chat, direct messages,
   message rendering, input handling, auto-scroll,
   system messages, chat tab switching, mock message data
   Depends on: toast.js
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   CHAT STATE
───────────────────────────────────────── */
const chatState = {
  activeTab:    'world',
  messages:     { world: [], alliance: [], dm: [] },
  dmTarget:     null,
  isOpen:       false,
  autoScroll:   true
};

/* ─────────────────────────────────────────
   MOCK INITIAL MESSAGES
───────────────────────────────────────── */
const MOCK_WORLD_MESSAGES = [
  { type:'system',   text:'⚔ Season 12 World War is LIVE — bid on cities now!',             time:'09:00' },
  { type:'world',    name:'DragonSlayer99', vip:null,      text:'Anyone want 1v1 on Europe?',              time:'09:12' },
  { type:'world',    name:'IronWolf',       vip:'diamond', text:'Looking for allies in Asia campaign',     time:'09:14' },
  { type:'system',   text:'🏙 IronWolf has captured Paris! Eastern Front crumbles.',          time:'09:15' },
  { type:'world',    name:'TankCommander',  vip:null,      text:'GG everyone in room #44 that was epic',  time:'09:18' },
  { type:'world',    name:'Pixelator',      vip:'gold',    text:'New map editor update is fire 🔥',        time:'09:21' },
  { type:'system',   text:'🏆 Season 12 ends in 18 days — check your ranking!',               time:'09:30' },
  { type:'world',    name:'StormBreaker',   vip:null,      text:'Starting World Map game, need 4 more',   time:'09:33' },
  { type:'world',    name:'CryptoGeneral',  vip:null,      text:'Anyone have strategy for naval warfare?', time:'09:35' },
  { type:'world',    name:'EagleEye',       vip:'diamond', text:'Diamond VIP perks are crazy good tbh',   time:'09:40' },
  { type:'world',    name:'Pixelator',      vip:'gold',    text:'@GHOST_RECON check your alliance DMs',   time:'09:44' },
  { type:'system',   text:'📢 New story chapter "Operation Arctic Storm" is available!',      time:'09:50' }
];

const MOCK_ALLIANCE_MESSAGES = [
  { type:'system',   text:'🤝 Alliance chat — Iron Pact',                                    time:'08:00' },
  { type:'alliance', name:'IronWolf',      vip:'diamond', text:'Coordinate on Eastern front tonight',     time:'08:30' },
  { type:'alliance', name:'TankCommander', vip:null,      text:'I will take Warsaw and Minsk',            time:'08:32' },
  { type:'alliance', name:'IronWolf',      vip:'diamond', text:'Perfect, I will push south from Berlin',  time:'08:35' },
  { type:'system',   text:'⚔ IronWolf declared war on Eastern Coalition',                    time:'09:00' },
  { type:'alliance', name:'TankCommander', vip:null,      text:'Everyone push their turns NOW',           time:'09:01' }
];

const MOCK_DM_MESSAGES = [
  { type:'dm', name:'Pixelator', vip:'gold', text:'Hey! Want to ally in the World Map game?',  time:'09:42', fromSelf:false },
  { type:'dm', name:'GHOST_RECON', vip:null, text:'Sure, what territory are you targeting?',  time:'09:43', fromSelf:true  },
  { type:'dm', name:'Pixelator', vip:'gold', text:'Going for South America, you take Africa?', time:'09:44', fromSelf:false }
];


/* ─────────────────────────────────────────
   INIT CHAT
───────────────────────────────────────── */
function initChat() {
  chatState.messages.world    = [...MOCK_WORLD_MESSAGES];
  chatState.messages.alliance = [...MOCK_ALLIANCE_MESSAGES];
  chatState.messages.dm       = [...MOCK_DM_MESSAGES];
  chatState.dmTarget          = 'Pixelator';

  renderChat(chatState.activeTab);
  startMockMessageStream();
}


/* ─────────────────────────────────────────
   RENDER CHAT MESSAGES
───────────────────────────────────────── */
function renderChat(tab) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  chatState.activeTab = tab;
  const messages = chatState.messages[tab] || [];

  if (messages.length === 0) {
    container.innerHTML = `
      <div style="
        display:flex;flex-direction:column;align-items:center;
        justify-content:center;height:100%;gap:1rem;
        color:var(--text-muted);text-align:center;padding:2rem
      ">
        <span style="font-size:32px">💬</span>
        <span style="font-family:var(--font-pixel);font-size:var(--px-xs);letter-spacing:1px">
          ${tab === 'alliance' ? 'NOT IN AN ALLIANCE' : 'NO MESSAGES YET'}
        </span>
        ${tab === 'alliance' ? '<span style="font-size:var(--mono-sm)">Join an alliance to chat with your team</span>' : ''}
      </div>`;
    return;
  }

  container.innerHTML = messages.map(msg => buildMessageHTML(msg, tab)).join('');
  scrollChatToBottom(container);
}

window.renderChat = renderChat;


/* ─────────────────────────────────────────
   BUILD MESSAGE HTML
───────────────────────────────────────── */
function buildMessageHTML(msg, tab) {
  // System messages
  if (msg.type === 'system') {
    return `
      <div class="chat-msg">
        <span class="chat-msg__name chat-msg__name--system">SYSTEM</span>
        <span class="chat-msg__text" style="color:var(--yellow);font-style:italic">
          ${escapeHtml(msg.text)}
        </span>
        <span class="chat-msg__time">${msg.time || ''}</span>
      </div>`;
  }

  // DM messages (self vs other)
  if (msg.type === 'dm') {
    const isSelf = msg.fromSelf;
    return `
      <div class="chat-msg" style="${isSelf ? 'text-align:right' : ''}">
        ${!isSelf ? `<span class="chat-msg__name chat-msg__name--dm"
          onclick="openMiniProfile('${escapeHtml(msg.name)}','🎯','Private',{wins:0,losses:0,winRate:0})"
        >${escapeHtml(msg.name)}</span>` : ''}
        <span class="chat-msg__text" style="
          ${isSelf
            ? 'color:var(--green);background:rgba(57,255,106,0.06);padding:2px 6px;display:inline-block'
            : ''}
        ">${escapeHtml(msg.text)}</span>
        ${isSelf ? `<span class="chat-msg__name chat-msg__name--dm" style="margin-left:4px">YOU</span>` : ''}
        <span class="chat-msg__time">${msg.time || ''}</span>
      </div>`;
  }

  // World / Alliance messages
  const nameClass = getNameClass(msg);
  const vipTag    = getVipTag(msg.vip);

  return `
    <div class="chat-msg">
      <span class="chat-msg__name ${nameClass}"
        onclick="openMiniProfile('${escapeHtml(msg.name)}','🪖','Player',{wins:100,losses:40,winRate:71})"
        title="Click to view profile"
      >${escapeHtml(msg.name)}${vipTag}</span>
      <span class="chat-msg__text">${highlightMentions(escapeHtml(msg.text))}</span>
      <span class="chat-msg__time">${msg.time || ''}</span>
    </div>`;
}


/* ─────────────────────────────────────────
   NAME CLASS RESOLVER
───────────────────────────────────────── */
function getNameClass(msg) {
  if (msg.vip === 'diamond') return 'chat-msg__name chat-msg__name--vip-diamond';
  if (msg.vip === 'gold')    return 'chat-msg__name chat-msg__name--vip-gold';
  if (msg.type === 'alliance') return 'chat-msg__name chat-msg__name--alliance';
  return 'chat-msg__name chat-msg__name--world';
}

function getVipTag(vip) {
  if (vip === 'diamond') return ' <span style="font-size:10px">💎</span>';
  if (vip === 'gold')    return ' <span style="font-size:10px">👑</span>';
  return '';
}


/* ─────────────────────────────────────────
   MENTION HIGHLIGHTING
   @USERNAME highlighted in messages
───────────────────────────────────────── */
function highlightMentions(text) {
  const username = window.GPW.user?.username || window.GPW.mockUser?.username || '';
  // Highlight all @mentions
  text = text.replace(/@([A-Za-z0-9_]+)/g, (match, name) => {
    const isSelf = name.toUpperCase() === username.toUpperCase();
    return `<span style="
      color:${isSelf ? 'var(--yellow)' : 'var(--cyan)'};
      background:${isSelf ? 'rgba(245,200,66,0.1)' : 'transparent'};
      padding:0 2px;font-family:var(--font-pixel);font-size:var(--px-xs)
    ">${match}</span>`;
  });
  return text;
}


/* ─────────────────────────────────────────
   SEND CHAT MESSAGE
───────────────────────────────────────── */
function sendChatMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  // Require login to chat
  if (!window.GPW.isLoggedIn) {
    input.value = '';
    showToast('Log in to send messages', 'info', '🔒');
    return;
  }

  const user = window.GPW.user || window.GPW.mockUser;
  const now  = getCurrentTime();
  const tab  = chatState.activeTab;

  const newMessage = {
    type:     tab,
    name:     user.username,
    vip:      user.vip,
    text,
    time:     now,
    fromSelf: true
  };

  // Add to message list
  chatState.messages[tab].push(newMessage);

  // Re-render
  renderChat(tab);

  // Clear input
  input.value = '';
  input.focus();

  // Simulate reply after short delay (world chat only)
  if (tab === 'world') {
    scheduleAutoReply(text);
  }
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

window.sendChatMessage = sendChatMessage;
window.handleChatKey   = handleChatKey;


/* ─────────────────────────────────────────
   SWITCH CHAT TAB (chat overlay)
───────────────────────────────────────── */
function switchChatTab(btn, tab) {
  document.querySelectorAll('.chat-overlay__tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  chatState.activeTab = tab;
  renderChat(tab);

  // Clear unread for this tab
  if (tab === 'world') {
    window.GPW.unreadMessages = 0;
    if (window.updateChatBadge) window.updateChatBadge();
  }
}

window.switchChatTab = switchChatTab;


/* ─────────────────────────────────────────
   AUTO SCROLL
───────────────────────────────────────── */
function scrollChatToBottom(container) {
  if (!container || !chatState.autoScroll) return;
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
}

// Detect if user scrolled up (disable auto scroll)
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  container.addEventListener('scroll', () => {
    const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 40;
    chatState.autoScroll = atBottom;
  });
});


/* ─────────────────────────────────────────
   MOCK AUTO REPLY STREAM
   Simulates other players chatting
───────────────────────────────────────── */
const AUTO_REPLIES = [
  { name:'DragonSlayer99', vip:null,      text:'Good game everyone!' },
  { name:'IronWolf',       vip:'diamond', text:'Who wants to ally next season?' },
  { name:'TankCommander',  vip:null,      text:'Bots are getting stronger this patch' },
  { name:'Pixelator',      vip:'gold',    text:'New unit skins just dropped in the shop 👀' },
  { name:'StormBreaker',   vip:null,      text:'Anyone tried the new story mode chapter?' },
  { name:'CryptoGeneral',  vip:null,      text:'Naval warfare is so underrated' },
  { name:'EagleEye',       vip:'diamond', text:'See you all on the world map 🌍' }
];

let _autoReplyIndex = 0;

function scheduleAutoReply(triggeredBy) {
  // Occasionally trigger a reply (not every time)
  if (Math.random() > 0.5) return;

  const delay   = 1500 + Math.random() * 2000;
  const replyTo = triggerContextualReply(triggeredBy);

  setTimeout(() => {
    const sender  = AUTO_REPLIES[_autoReplyIndex % AUTO_REPLIES.length];
    _autoReplyIndex++;

    const msg = {
      type: 'world',
      name: sender.name,
      vip:  sender.vip,
      text: replyTo || sender.text,
      time: getCurrentTime()
    };

    chatState.messages.world.push(msg);
    if (chatState.activeTab === 'world') {
      renderChat('world');
    } else {
      // Increment unread badge
      window.GPW.unreadMessages = (window.GPW.unreadMessages || 0) + 1;
      if (window.updateChatBadge) window.updateChatBadge();
    }
  }, delay);
}

function triggerContextualReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes('ally') || lower.includes('alliance'))
    return 'Sure, DM me about the alliance terms!';
  if (lower.includes('help') || lower.includes('how'))
    return 'Check the About page for tips!';
  if (lower.includes('war') || lower.includes('fight'))
    return 'Let\'s do it! Starting a game now';
  if (lower.includes('shop') || lower.includes('skin'))
    return 'The Elite tier skins are worth it tbh';
  return null;
}

function startMockMessageStream() {
  // Drip in system messages periodically while chat is open
  setInterval(() => {
    if (!chatState.isOpen) return;

    const systemMessages = [
      '⚔ A battle is raging on the Eastern Front!',
      '🏙 Berlin has changed hands!',
      '🤝 A new alliance has formed: Steel Brotherhood',
      '📢 Quick match available — join now!',
      '🏆 EagleEye just reached General rank!'
    ];

    if (Math.random() < 0.15) {
      const text = systemMessages[Math.floor(Math.random() * systemMessages.length)];
      const msg  = { type:'system', text, time: getCurrentTime() };
      chatState.messages.world.push(msg);

      if (chatState.activeTab === 'world') {
        renderChat('world');
      }
    }
  }, 30000); // every 30s
}


/* ─────────────────────────────────────────
   CHAT IN LOBBY SIDEBAR
   Separate mini-chat used in lobby page
───────────────────────────────────────── */
function initLobbyChatPanel() {
  const panel = document.getElementById('lobbyChatMessages');
  if (!panel) return;

  // Render last N world messages
  const messages = chatState.messages.world.slice(-8);
  panel.innerHTML = messages.map(m => buildMessageHTML(m, 'world')).join('');
  panel.scrollTop = panel.scrollHeight;
}

window.initLobbyChatPanel = initLobbyChatPanel;

function sendLobbyChatMessage() {
  const input = document.getElementById('lobbyChatInput');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  if (!window.GPW.isLoggedIn) {
    showToast('Log in to chat', 'info', '🔒');
    input.value = '';
    return;
  }

  const user = window.GPW.user || window.GPW.mockUser;
  const msg  = {
    type: 'world',
    name: user.username,
    vip:  user.vip,
    text,
    time: getCurrentTime()
  };

  chatState.messages.world.push(msg);
  initLobbyChatPanel();
  input.value = '';

  // Mirror to main chat overlay
  if (chatState.activeTab === 'world') {
    renderChat('world');
  }
}

function handleLobbyChatKey(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendLobbyChatMessage();
  }
}

window.sendLobbyChatMessage = sendLobbyChatMessage;
window.handleLobbyChatKey   = handleLobbyChatKey;


/* ─────────────────────────────────────────
   OPEN CHAT OVERLAY ON SPECIFIC TAB
───────────────────────────────────────── */
function openChatTab(tab) {
  const overlay = document.getElementById('chatOverlay');
  if (!overlay) return;

  overlay.classList.add('open');
  chatState.isOpen = true;

  const tabBtn = document.querySelector(`.chat-overlay__tab[onclick*="'${tab}'"]`);
  if (tabBtn) {
    switchChatTab(tabBtn, tab);
  } else {
    renderChat(tab);
  }

  setTimeout(() => {
    const input = document.getElementById('chatInput');
    if (input) input.focus();
  }, 300);
}

window.openChatTab = openChatTab;


/* ─────────────────────────────────────────
   TRACK CHAT OVERLAY OPEN STATE
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('chatOverlay');
  if (!overlay) return;

  const observer = new MutationObserver(() => {
    chatState.isOpen = overlay.classList.contains('open');
    if (chatState.isOpen) {
      renderChat(chatState.activeTab);
    }
  });

  observer.observe(overlay, { attributes:true, attributeFilter:['class'] });
});


/* ─────────────────────────────────────────
   UTILITY: Get current time string HH:MM
───────────────────────────────────────── */
function getCurrentTime() {
  const now = new Date();
  return now.getHours().toString().padStart(2,'0') + ':' +
         now.getMinutes().toString().padStart(2,'0');
}


/* ─────────────────────────────────────────
   BOOT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initChat();
});
