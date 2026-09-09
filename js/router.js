/* ============================================================
   ROUTER.JS — The Great Pixels War
   Page navigation, browser history, back button, breadcrumb,
   dynamic page loading, page lifecycle hooks
   ============================================================ */

'use strict';

const PAGES = {
  home:        { id:'home',        title:'The Great Pixels War',              src:'pages/home.html',        breadcrumb:[],                          showBack:false },
  play:        { id:'play',        title:'Play — GPW',                        src:'pages/play.html',        breadcrumb:['HOME','PLAY'],              showBack:true  },
  lobby:       { id:'lobby',       title:'Lobby — GPW',                       src:'pages/lobby.html',       breadcrumb:['HOME','PLAY','LOBBY'],      showBack:true  },
  'season-war':{ id:'season-war',  title:'Season War — GPW',                  src:'pages/season-war.html',  breadcrumb:['HOME','SEASON WAR'],        showBack:true  },
  story:       { id:'story',       title:'Story — GPW',                       src:'pages/story.html',       breadcrumb:['HOME','STORY'],             showBack:true  },
  leaderboard: { id:'leaderboard', title:'Leaderboard — GPW',                 src:'pages/leaderboard.html', breadcrumb:['HOME','LEADERBOARD'],       showBack:true  },
  shop:        { id:'shop',        title:'Shop — GPW',                        src:'pages/shop.html',        breadcrumb:['HOME','SHOP'],              showBack:true  },
  profile:     { id:'profile',     title:'Profile — GPW',                     src:'pages/profile.html',     breadcrumb:['HOME','PROFILE'],           showBack:true  },
  about:       { id:'about',       title:'About — GPW',                       src:'pages/about.html',       breadcrumb:['HOME','ABOUT'],             showBack:true  }
};

const pageCache = {};
const pageHooks = { onEnter:{}, onLeave:{} };

function registerPageHook(event, pageId, fn) {
  if (!pageHooks[event]) pageHooks[event] = {};
  pageHooks[event][pageId] = fn;
}
window.registerPageHook = registerPageHook;

async function navigate(pageId, params = {}) {
  const page = PAGES[pageId];
  if (!page) { console.warn('[Router] Unknown page:', pageId); return; }

  const prevPage = window.GPW.currentPage;
  if (prevPage === pageId && !params.force) return;

  closeAllOverlays();

  if (pageHooks.onLeave[prevPage]) {
    try { pageHooks.onLeave[prevPage](prevPage); } catch(e) {}
  }

  window.history.pushState({ pageId, params }, page.title, pageId === 'home' ? '/' : '#' + pageId);
  document.title = page.title;

  window.GPW.pageHistory.push(prevPage);
  window.GPW.currentPage = pageId;

  hideAllPages();
  await loadPage(page, params);

  updateBackBar(page);
  updateBreadcrumb(page);
  if (window.updateNavActiveLink) window.updateNavActiveLink(pageId);
  window.scrollTo({ top:0, behavior:'instant' });

  if (pageHooks.onEnter[pageId]) {
    try { pageHooks.onEnter[pageId](pageId, params); } catch(e) {}
  }
}
window.navigate = navigate;

async function loadPage(page, params = {}) {
  const container = document.getElementById('page-' + page.id);
  if (!container) return;

  container.style.display = 'block';

  if (pageCache[page.id]) {
    animatePageEntry(container);
    return;
  }

  showPageSkeleton(container);

  try {
    const res = await fetch(page.src);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    container.innerHTML = await res.text();
    pageCache[page.id] = true;
    animatePageEntry(container);
  } catch(e) {
    container.innerHTML = buildErrorPage(page.id, e.message);
    console.error('[Router] Failed to load page "' + page.id + '":', e);
  }
}

function showPageSkeleton(container) {
  container.innerHTML = `
    <div style="padding:2rem;max-width:900px;margin:0 auto">
      <div class="skeleton" style="height:48px;width:40%;margin-bottom:1rem"></div>
      <div class="skeleton" style="height:24px;width:70%;margin-bottom:2rem"></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem">
        <div class="skeleton" style="height:140px"></div>
        <div class="skeleton" style="height:140px"></div>
        <div class="skeleton" style="height:140px"></div>
      </div>
    </div>`;
}

function buildErrorPage(pageId, msg) {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:1.5rem;padding:2rem;text-align:center">
      <div style="font-size:48px">⚠</div>
      <div style="font-family:var(--font-pixel);font-size:var(--px-md);color:var(--red)">PAGE LOAD FAILED</div>
      <div style="font-size:var(--mono-md);color:var(--text-dim);max-width:400px">
        Could not load <strong>${pageId}</strong>. Run from a local server, not file://.
      </div>
      <div style="font-size:var(--mono-sm);color:var(--text-muted)">${msg}</div>
      <button class="btn btn--green" onclick="navigate('home')">← BACK TO HOME</button>
    </div>`;
}

function hideAllPages() {
  Object.keys(PAGES).forEach(id => {
    const el = document.getElementById('page-' + id);
    if (el) el.style.display = 'none';
  });
}

function animatePageEntry(container) {
  container.style.animation = 'none';
  container.offsetHeight;
  container.style.animation = 'page-enter 0.2s ease forwards';
}

function goBack() {
  const history = window.GPW.pageHistory;
  if (history.length > 0) {
    navigateReplace(history.pop());
  } else {
    navigate('home');
  }
}
window.goBack = goBack;

async function navigateReplace(pageId) {
  const page = PAGES[pageId];
  if (!page) return navigate('home');

  const prevPage = window.GPW.currentPage;
  closeAllOverlays();

  if (pageHooks.onLeave[prevPage]) {
    try { pageHooks.onLeave[prevPage](prevPage); } catch(e) {}
  }

  window.history.replaceState({ pageId }, page.title, pageId === 'home' ? '/' : '#' + pageId);
  document.title = page.title;
  window.GPW.currentPage = pageId;

  hideAllPages();
  await loadPage(page);

  updateBackBar(page);
  updateBreadcrumb(page);
  if (window.updateNavActiveLink) window.updateNavActiveLink(pageId);
  window.scrollTo({ top:0, behavior:'instant' });

  if (pageHooks.onEnter[pageId]) {
    try { pageHooks.onEnter[pageId](pageId); } catch(e) {}
  }
}

function updateBackBar(page) {
  const backBar = document.getElementById('backBar');
  if (backBar) backBar.style.display = page.showBack ? 'flex' : 'none';
}

function updateBreadcrumb(page) {
  const crumb = document.getElementById('breadcrumb');
  if (!crumb || !page.breadcrumb) return;

  const pageIdMap = {
    HOME:'home', PLAY:'play', LOBBY:'lobby',
    'SEASON WAR':'season-war', STORY:'story',
    LEADERBOARD:'leaderboard', SHOP:'shop',
    PROFILE:'profile', ABOUT:'about'
  };

  crumb.innerHTML = page.breadcrumb.map((part, i) => {
    const isLast = i === page.breadcrumb.length - 1;
    if (isLast) return '<span>' + part + '</span>';
    const tid = pageIdMap[part] || 'home';
    return '<span><a href="#" onclick="navigate(\'' + tid + '\');return false;" style="color:var(--text-dim);transition:color 0.15s" onmouseover="this.style.color=\'var(--text)\'" onmouseout="this.style.color=\'var(--text-dim)\'">' + part + '</a></span>';
  }).join('');
}

function closeAllOverlays() {
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  document.body.classList.remove('modal-open');
  if (window.closeNotifPanel)     window.closeNotifPanel();
  if (window.closeChatOverlay)    window.closeChatOverlay();
  if (window.closeAvatarDropdown) window.closeAvatarDropdown();
  if (window.closeMobileMenu)     window.closeMobileMenu();
}
window.closeAllOverlays = closeAllOverlays;

window.addEventListener('popstate', (e) => {
  if (e.state && e.state.pageId) {
    const page = PAGES[e.state.pageId];
    if (!page) return;
    window.GPW.currentPage = page.id;
    hideAllPages();
    loadPage(page).then(() => {
      updateBackBar(page);
      updateBreadcrumb(page);
      if (window.updateNavActiveLink) window.updateNavActiveLink(page.id);
    });
  } else {
    navigate('home');
  }
});

function readInitialRoute() {
  const hash = window.location.hash.replace('#', '').trim();
  return (hash && PAGES[hash]) ? hash : 'home';
}

document.addEventListener('DOMContentLoaded', async () => {
  const initialPage = readInitialRoute();
  window.history.replaceState(
    { pageId: initialPage },
    PAGES[initialPage]?.title || 'The Great Pixels War',
    initialPage === 'home' ? '/' : '#' + initialPage
  );
  window.GPW.currentPage = initialPage;
  const page = PAGES[initialPage];
  if (page) {
    await loadPage(page);
    updateBackBar(page);
    updateBreadcrumb(page);
  }
});
