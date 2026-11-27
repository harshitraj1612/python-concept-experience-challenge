/**
 * Loop Lab — User & Auth System
 * Handles: profile creation, username, authenticated vs guest users,
 * quiz score tracking, and localStorage persistence.
 * Guest users get a session-only experience; their data is never persisted.
 */
(() => {
  /* ── Constants ───────────────────────────────────────────────── */
  const USER_KEY   = 'looplab_user_v1';
  const SCORES_KEY = 'looplab_scores_v1';
  const GUEST_PREFIX = 'Guest';

  /* ── Helpers ─────────────────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function store(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
  function load(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }

  /* ── State ───────────────────────────────────────────────────── */
  let user   = load(USER_KEY);  // null = not set up yet
  let scores = load(SCORES_KEY) || {};
  let isGuest = false;

  function currentUsername() {
    return isGuest ? (user && user.guestName ? user.guestName : 'Guest') : (user ? user.name : null);
  }

  /* ── Score helpers (guests use in-memory only) ──────────────── */
  window.LoopLabUser = {
    recordQuiz(topicId, correct, total) {
      const entry = { correct, total, pct: Math.round(correct / total * 100), ts: Date.now() };
      scores[topicId] = entry;
      if (!isGuest) store(SCORES_KEY, scores);
    },
    getScores() { return scores; },
    getUser()   { return { name: currentUsername(), isGuest }; },
    isGuest()   { return isGuest; }
  };

  /* ── Build the modal markup ──────────────────────────────────── */
  function injectModal() {
    const overlay = document.createElement('div');
    overlay.id = 'llUserOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Create your profile');
    overlay.innerHTML = `
<div class="ll-modal" id="llModal">
  <div class="ll-modal-logo">
    <span class="ll-logo-mark">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5.5 9v11h13V9M9.5 20v-6h5v6"/></svg>
    </span>
    <span class="ll-logo-text">loop lab</span>
  </div>
  <h2 class="ll-modal-title">Welcome to Loop Lab</h2>
  <p class="ll-modal-sub">Create a profile to track your progress, or continue as a guest.</p>
  <div class="ll-modal-tabs" role="tablist">
    <button class="ll-tab active" id="llTabSign" role="tab" aria-selected="true">Sign up / Log in</button>
    <button class="ll-tab" id="llTabGuest" role="tab" aria-selected="false">Continue as Guest</button>
  </div>

  <!-- SIGNED IN PANEL -->
  <div class="ll-panel" id="llPanelSign">
    <label class="ll-label" for="llNameInput">Choose a username</label>
    <input class="ll-input" id="llNameInput" type="text"
      placeholder="e.g. python_wizard" maxlength="24"
      autocomplete="username" spellcheck="false" />
    <p class="ll-hint" id="llNameHint"></p>
    <button class="ll-btn-primary" id="llSaveBtn">Create Profile &amp; Start</button>
    <p class="ll-fine">Your username is stored locally in your browser. No account or password required.</p>
  </div>

  <!-- GUEST PANEL -->
  <div class="ll-panel" id="llPanelGuest" hidden>
    <div class="ll-guest-info">
      <svg class="ll-guest-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
      <div>
        <strong>Guest mode</strong>
        <p>You can explore all topics and simulations. Quiz scores will <em>not</em> be saved between visits, and AI analysis won't be personalized.</p>
      </div>
    </div>
    <button class="ll-btn-secondary" id="llGuestBtn">Continue as Guest</button>
  </div>
</div>`;
    document.body.appendChild(overlay);
    bindModal(overlay);
  }

  function bindModal(overlay) {
    const tabSign   = $('llTabSign');
    const tabGuest  = $('llTabGuest');
    const panelSign = $('llPanelSign');
    const panelGuest= $('llPanelGuest');
    const nameInput = $('llNameInput');
    const nameHint  = $('llNameHint');
    const saveBtn   = $('llSaveBtn');
    const guestBtn  = $('llGuestBtn');

    function switchTab(toGuest) {
      tabSign.classList.toggle('active', !toGuest);
      tabGuest.classList.toggle('active', toGuest);
      tabSign.setAttribute('aria-selected', String(!toGuest));
      tabGuest.setAttribute('aria-selected', String(toGuest));
      panelSign.hidden  = toGuest;
      panelGuest.hidden = !toGuest;
    }

    tabSign.addEventListener('click', () => switchTab(false));
    tabGuest.addEventListener('click', () => switchTab(true));

    function validate(val) {
      const v = val.trim();
      if (!v) return 'Please enter a username.';
      if (v.length < 2) return 'Must be at least 2 characters.';
      if (!/^[a-zA-Z0-9_.\- ]+$/.test(v)) return 'Only letters, numbers, spaces, _, . and - allowed.';
      return '';
    }

    nameInput.addEventListener('input', () => {
      const err = validate(nameInput.value);
      nameHint.textContent = err;
      nameHint.className = 'll-hint' + (err ? ' ll-hint-error' : '');
    });

    saveBtn.addEventListener('click', () => {
      const val = nameInput.value.trim();
      const err = validate(val);
      if (err) { nameHint.textContent = err; nameHint.className = 'll-hint ll-hint-error'; return; }
      user = { name: val, createdAt: Date.now() };
      isGuest = false;
      scores = load(SCORES_KEY) || {};
      store(USER_KEY, user);
      closeModal(overlay);
      renderAvatar();
    });

    guestBtn.addEventListener('click', () => {
      const num = Math.floor(Math.random() * 9000) + 1000;
      user = { guestName: `${GUEST_PREFIX}${num}`, createdAt: Date.now() };
      isGuest = true;
      scores = {}; // fresh in-memory, never persisted
      closeModal(overlay);
      renderAvatar();
    });

    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveBtn.click(); });
    overlay.addEventListener('click', e => { if (e.target === overlay) guestBtn.click(); });
  }

  function closeModal(overlay) {
    overlay.classList.add('ll-closing');
    setTimeout(() => overlay.remove(), 350);
  }

  /* ── Avatar / nav chip ───────────────────────────────────────── */
  function renderAvatar() {
    const existing = document.querySelector('.ll-avatar-wrap');
    if (existing) existing.remove();

    const name  = currentUsername() || '?';
    const initials = name.slice(0,2).toUpperCase();
    const wrap = document.createElement('div');
    wrap.className = 'll-avatar-wrap';
    wrap.setAttribute('aria-label', `Logged in as ${esc(name)}`);
    wrap.title = name;
    wrap.innerHTML = `
      <button class="ll-avatar" id="llAvatarBtn" aria-haspopup="true" aria-expanded="false">
        <span class="ll-avatar-initials">${esc(initials)}</span>
        ${isGuest ? '<span class="ll-guest-badge">Guest</span>' : ''}
      </button>
      <div class="ll-avatar-menu" id="llAvatarMenu" role="menu" hidden>
        <div class="ll-avatar-name">${esc(name)}${isGuest ? ' <span class="ll-chip-guest">Guest</span>' : ''}</div>
        <hr class="ll-menu-sep"/>
        <button class="ll-menu-item" id="llMenuProfile" role="menuitem">📊 My Progress</button>
        ${isGuest ? '<button class="ll-menu-item ll-menu-cta" id="llMenuSignup" role="menuitem">Create Profile</button>' : ''}
        <button class="ll-menu-item ll-menu-danger" id="llMenuSignout" role="menuitem">Sign Out</button>
      </div>`;

    // Insert into topbar
    const topbar = document.querySelector('.topbar, .nav');
    if (topbar) topbar.appendChild(wrap);

    const btn  = $('llAvatarBtn');
    const menu = $('llAvatarMenu');

    btn.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', e => {
      if (!wrap.contains(e.target)) { menu.hidden = true; btn.setAttribute('aria-expanded','false'); }
    });

    const profileBtn = $('llMenuProfile');
    if (profileBtn) profileBtn.addEventListener('click', () => { menu.hidden = true; showProgressPanel(); });

    const signupBtn = $('llMenuSignup');
    if (signupBtn) signupBtn.addEventListener('click', () => { menu.hidden = true; injectModal(); });

    const signoutBtn = $('llMenuSignout');
    if (signoutBtn) signoutBtn.addEventListener('click', () => {
      if (!isGuest) { try { localStorage.removeItem(USER_KEY); localStorage.removeItem(SCORES_KEY); } catch {} }
      user = null; isGuest = false; scores = {};
      wrap.remove();
      injectModal();
    });
  }

  /* ── Progress panel ──────────────────────────────────────────── */
  function showProgressPanel() {
    const existing = $('llProgressPanel');
    if (existing) { existing.remove(); return; }

    const topics  = window.TOPICS || [];
    const allScores = scores;
    const done    = topics.filter(t => allScores[t.id] && allScores[t.id].pct >= 50).length;
    const total   = topics.length;
    const avgPct  = total ? Math.round(Object.values(allScores).reduce((a,s) => a + (s.pct||0), 0) / Math.max(Object.values(allScores).length,1)) : 0;

    const panel = document.createElement('aside');
    panel.id = 'llProgressPanel';
    panel.setAttribute('aria-label', 'Your progress');
    panel.innerHTML = `
      <div class="ll-prog-header">
        <div>
          <h3 class="ll-prog-title">📊 My Progress</h3>
          <p class="ll-prog-sub">${esc(currentUsername())} · ${isGuest ? 'Guest session' : 'Saved profile'}</p>
        </div>
        <button class="ll-prog-close" id="llProgClose" aria-label="Close progress panel">✕</button>
      </div>
      <div class="ll-prog-stats">
        <div class="ll-stat"><span class="ll-stat-num">${done}</span><span class="ll-stat-label">Topics passed</span></div>
        <div class="ll-stat"><span class="ll-stat-num">${total}</span><span class="ll-stat-label">Total topics</span></div>
        <div class="ll-stat"><span class="ll-stat-num">${avgPct}%</span><span class="ll-stat-label">Avg score</span></div>
      </div>
      <div class="ll-ai-analysis" id="llAiAnalysis">
        <div class="ll-ai-header">
          <span class="ll-ai-label">✦ AI Performance Analysis</span>
          <span class="ll-ai-loading" id="llAiLoading">Analyzing…</span>
        </div>
        <div class="ll-ai-body" id="llAiBody"></div>
      </div>
      <div class="ll-topic-list">
        ${topics.sort((a,b) => a.id.localeCompare(b.id)).map(t => {
          const s = allScores[t.id];
          const pct = s ? s.pct : null;
          const icon = pct === null ? '○' : pct >= 80 ? '✦' : pct >= 50 ? '◑' : '✗';
          const cls  = pct === null ? '' : pct >= 80 ? 'll-tl-great' : pct >= 50 ? 'll-tl-ok' : 'll-tl-low';
          return `<div class="ll-tl-row ${cls}">
            <span class="ll-tl-icon">${icon}</span>
            <span class="ll-tl-name">${esc(t.id)} · ${esc(t.title)}</span>
            <span class="ll-tl-score">${pct !== null ? pct + '%' : '—'}</span>
          </div>`;
        }).join('')}
      </div>
      ${isGuest ? '<p class="ll-guest-warn">⚠️ Guest data is session-only and will not be saved.</p>' : ''}
    `;
    document.body.appendChild(panel);

    $('llProgClose').addEventListener('click', () => panel.remove());

    // Trigger AI analysis
    if (window.LoopLabAI) {
      window.LoopLabAI.analyze(scores, currentUsername(), isGuest)
        .then(text => {
          $('llAiLoading').remove();
          $('llAiBody').innerHTML = text;
        });
    } else {
      $('llAiLoading').textContent = 'Complete some quizzes to see analysis.';
    }
  }

  /* ── Boot ────────────────────────────────────────────────────── */
  function boot() {
    if (user && user.name) {
      isGuest = false;
      scores = load(SCORES_KEY) || {};
      renderAvatar();
    } else if (user && user.guestName) {
      // returning page load with a guest set — reset to fresh guest
      isGuest = true;
      scores = {};
      renderAvatar();
    } else {
      injectModal();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
