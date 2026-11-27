/**
 * Loop Lab — User & Auth System
 * Handles: owner login, profile creation, username, authenticated vs guest users,
 * quiz score tracking, and localStorage persistence.
 *
 * SECURITY NOTE: Owner credentials are verified via SHA-256 hash using the
 * Web Crypto API. The raw password is NEVER stored anywhere. This is suitable
 * for a static site owner dashboard but is not a substitute for server-side auth.
 *
 * Owner: username=harshitraj
 * Password hash (SHA-256): ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f
 */
(() => {
  /* ── Constants ───────────────────────────────────────────────── */
  const USER_KEY       = 'looplab_user_v1';
  const SCORES_KEY     = 'looplab_scores_v1';
  const ALL_SCORES_KEY = 'looplab_all_scores_v1'; // owner view: all users
  const GUEST_PREFIX   = 'Guest';

  // Owner credentials (password stored ONLY as SHA-256 hash — never plaintext)
  const OWNER_USERNAME  = 'harshitraj';
  const OWNER_PWD_HASH  = 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f';

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
  let user    = load(USER_KEY);
  let scores  = load(SCORES_KEY) || {};
  let isGuest = false;
  let isOwner = false;

  function currentUsername() {
    if (isOwner) return OWNER_USERNAME;
    if (isGuest) return (user && user.guestName) ? user.guestName : 'Guest';
    return user ? user.name : null;
  }

  /* ── SHA-256 via Web Crypto (async) ─────────────────────────── */
  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  /* ── Score helpers ───────────────────────────────────────────── */
  window.LoopLabUser = {
    recordQuiz(topicId, correct, total) {
      const entry = { correct, total, pct: Math.round(correct / total * 100), ts: Date.now() };
      scores[topicId] = entry;
      if (!isGuest) store(SCORES_KEY, scores);
      // owner: also persist aggregated scores for the dashboard
      if (isOwner) {
        const all = load(ALL_SCORES_KEY) || {};
        if (!all[OWNER_USERNAME]) all[OWNER_USERNAME] = {};
        all[OWNER_USERNAME][topicId] = entry;
        store(ALL_SCORES_KEY, all);
      }
    },
    getScores() { return scores; },
    getUser()   { return { name: currentUsername(), isGuest, isOwner }; },
    isGuest()   { return isGuest; },
    isOwner()   { return isOwner; }
  };

  /* ── Build the modal markup ──────────────────────────────────── */
  function injectModal() {
    const existing = $('llUserOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'llUserOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Create your profile or sign in');
    overlay.innerHTML = `
<div class="ll-modal" id="llModal">
  <button class="ll-modal-close" id="llModalClose" type="button" aria-label="Close dialog as guest">✕</button>
  <div class="ll-modal-logo">
    <span class="ll-logo-mark">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5.5 9v11h13V9M9.5 20v-6h5v6"/></svg>
    </span>
    <span class="ll-logo-text">loop lab</span>
  </div>
  <h2 class="ll-modal-title">Welcome to Loop Lab</h2>
  <p class="ll-modal-sub">Create a profile to track your progress, or continue as a guest.</p>

  <div class="ll-modal-tabs" role="tablist">
    <button class="ll-tab active" id="llTabSign"  role="tab" aria-selected="true">Sign up / Log in</button>
    <button class="ll-tab"        id="llTabGuest" role="tab" aria-selected="false">Guest</button>
    <button class="ll-tab"        id="llTabOwner" role="tab" aria-selected="false">🔑 Owner</button>
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
        <p>You can explore all topics and simulations. Quiz scores will <em>not</em> be saved between visits.</p>
      </div>
    </div>
    <button class="ll-btn-secondary" id="llGuestBtn">Continue as Guest</button>
  </div>

  <!-- OWNER PANEL -->
  <div class="ll-panel" id="llPanelOwner" hidden>
    <div class="ll-owner-info">
      <span class="ll-owner-crown">👑</span>
      <div>
        <strong>Owner Access</strong>
        <p>Sign in to access the owner dashboard — user analytics, all scores, and site controls.</p>
      </div>
    </div>
    <label class="ll-label" for="llOwnerUser">Username</label>
    <input class="ll-input" id="llOwnerUser" type="text"
      placeholder="Owner username" autocomplete="username" spellcheck="false" />
    <label class="ll-label" for="llOwnerPass" style="margin-top:12px">Password</label>
    <div class="ll-pwd-wrap">
      <input class="ll-input" id="llOwnerPass" type="password"
        placeholder="••••••••" autocomplete="current-password" />
      <button class="ll-pwd-toggle" id="llPwdToggle" type="button" aria-label="Show password">👁</button>
    </div>
    <p class="ll-hint ll-hint-error" id="llOwnerHint" style="min-height:18px"></p>
    <button class="ll-btn-primary ll-btn-owner" id="llOwnerBtn">
      <span id="llOwnerBtnLabel">Sign in as Owner</span>
    </button>
    <p class="ll-fine">Credentials are verified with SHA-256. Your password is never stored.</p>
  </div>
</div>`;
    document.body.appendChild(overlay);
    bindModal(overlay);
  }

  function bindModal(overlay) {
    const tabs   = { sign: $('llTabSign'), guest: $('llTabGuest'), owner: $('llTabOwner') };
    const panels = { sign: $('llPanelSign'), guest: $('llPanelGuest'), owner: $('llPanelOwner') };

    function switchTab(which) {
      Object.entries(tabs).forEach(([k,t]) => {
        t.classList.toggle('active', k === which);
        t.setAttribute('aria-selected', String(k === which));
      });
      Object.entries(panels).forEach(([k,p]) => { p.hidden = k !== which; });
    }

    tabs.sign.addEventListener('click',  () => switchTab('sign'));
    tabs.guest.addEventListener('click', () => switchTab('guest'));
    tabs.owner.addEventListener('click', () => switchTab('owner'));

    const tabKeys = ['sign', 'guest', 'owner'];
    tabKeys.forEach((key, idx) => {
      tabs[key].addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          const nextKey = tabKeys[(idx + 1) % tabKeys.length];
          tabs[nextKey].focus();
          switchTab(nextKey);
        } else if (e.key === 'ArrowLeft') {
          const prevKey = tabKeys[(idx - 1 + tabKeys.length) % tabKeys.length];
          tabs[prevKey].focus();
          switchTab(prevKey);
        }
      });
    });

    /* — Sign-up tab — */
    const nameInput = $('llNameInput');
    const nameHint  = $('llNameHint');
    const saveBtn   = $('llSaveBtn');

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
      isGuest = false; isOwner = false;
      scores = load(SCORES_KEY) || {};
      store(USER_KEY, user);
      closeModal(overlay);
      renderAvatar();
    });
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveBtn.click(); });

    /* — Guest tab — */
    $('llGuestBtn').addEventListener('click', () => {
      let gName = (user && user.guestName) ? user.guestName : `${GUEST_PREFIX}${Math.floor(Math.random() * 9000) + 1000}`;
      user = { guestName: gName, isGuest: true, createdAt: Date.now() };
      isGuest = true; isOwner = false;
      scores = {};
      store(USER_KEY, user); // Persist guest session so page refresh preserves state!
      closeModal(overlay);
      renderAvatar();
    });

    /* — Owner tab — */
    const ownerHint  = $('llOwnerHint');
    const ownerBtn   = $('llOwnerBtn');
    const ownerLabel = $('llOwnerBtnLabel');
    const pwdInput   = $('llOwnerPass');
    const pwdToggle  = $('llPwdToggle');

    // Password visibility toggle
    pwdToggle.addEventListener('click', () => {
      const show = pwdInput.type === 'password';
      pwdInput.type = show ? 'text' : 'password';
      pwdToggle.textContent = show ? '🙈' : '👁';
      pwdToggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });

    // Allow Enter key in password field
    pwdInput.addEventListener('keydown', e => { if (e.key === 'Enter') ownerBtn.click(); });
    $('llOwnerUser').addEventListener('keydown', e => { if (e.key === 'Enter') pwdInput.focus(); });

    ownerBtn.addEventListener('click', async () => {
      const uname = $('llOwnerUser').value.trim();
      const pwd   = pwdInput.value;
      ownerHint.textContent = '';

      if (!uname || !pwd) {
        ownerHint.textContent = 'Please enter both username and password.';
        return;
      }
      if (uname.toLowerCase() !== OWNER_USERNAME.toLowerCase()) {
        ownerHint.textContent = 'Invalid username or password.';
        return;
      }

      // Show loading state
      ownerBtn.disabled = true;
      ownerLabel.textContent = 'Verifying…';

      try {
        const hash = await sha256(pwd);
        if (hash === OWNER_PWD_HASH) {
          user = { name: OWNER_USERNAME, isOwner: true, createdAt: Date.now() };
          isOwner = true; isGuest = false;
          scores = load(SCORES_KEY) || {};
          store(USER_KEY, user);
          closeModal(overlay);
          renderAvatar();
        } else {
          ownerHint.textContent = 'Invalid username or password.';
          ownerBtn.disabled = false;
          ownerLabel.textContent = 'Sign in as Owner';
          pwdInput.value = '';
          pwdInput.focus();
        }
      } catch {
        ownerHint.textContent = 'Verification failed. Try again.';
        ownerBtn.disabled = false;
        ownerLabel.textContent = 'Sign in as Owner';
      }
    });

    const modalClose = $('llModalClose');
    if (modalClose) {
      modalClose.addEventListener('click', () => $('llGuestBtn').click());
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && document.getElementById('llUserOverlay')) {
        $('llGuestBtn').click();
        window.removeEventListener('keydown', onKeyDown);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    overlay.addEventListener('click', e => {
      if (e.target === overlay) $('llGuestBtn').click();
    });
  }

  function closeModal(overlay) {
    overlay.classList.add('ll-closing');
    setTimeout(() => overlay.remove(), 350);
  }

  /* ── Avatar / nav chip ───────────────────────────────────────── */
  function renderAvatar() {
    const existing = document.querySelector('.ll-avatar-wrap');
    if (existing) existing.remove();

    const name    = currentUsername() || '?';
    const initials = name.slice(0,2).toUpperCase();
    const wrap = document.createElement('div');
    wrap.className = 'll-avatar-wrap';
    wrap.setAttribute('aria-label', `Signed in as ${esc(name)}`);

    wrap.innerHTML = `
      <button class="ll-avatar${isOwner ? ' ll-avatar-owner' : ''}" id="llAvatarBtn"
        aria-haspopup="true" aria-expanded="false" title="${esc(name)}">
        ${isOwner
          ? '<span class="ll-avatar-crown" aria-hidden="true">👑</span>'
          : `<span class="ll-avatar-initials">${esc(initials)}</span>`}
        ${isGuest ? '<span class="ll-guest-badge">Guest</span>' : ''}
        ${isOwner ? '<span class="ll-owner-badge">Owner</span>' : ''}
      </button>
      <div class="ll-avatar-menu" id="llAvatarMenu" role="menu" hidden>
        <div class="ll-avatar-name">
          ${isOwner ? '👑 ' : ''}${esc(name)}
          ${isGuest ? '<span class="ll-chip-guest">Guest</span>' : ''}
          ${isOwner ? '<span class="ll-chip-owner">Owner</span>' : ''}
        </div>
        <hr class="ll-menu-sep"/>
        <button class="ll-menu-item" id="llMenuProfile" role="menuitem">📊 My Progress</button>
        ${isOwner ? '<button class="ll-menu-item ll-menu-owner-dash" id="llMenuDash" role="menuitem">🛠 Owner Dashboard</button>' : ''}
        ${isGuest ? '<button class="ll-menu-item ll-menu-cta" id="llMenuSignup" role="menuitem">Create Profile</button>' : ''}
        <button class="ll-menu-item ll-menu-danger" id="llMenuSignout" role="menuitem">Sign Out</button>
      </div>`;

    const links = document.querySelector('.links');
    if (links) {
      links.appendChild(wrap);
    } else {
      const topbar = document.querySelector('.topbar, .nav');
      if (topbar) topbar.appendChild(wrap);
    }

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

    const dashBtn = $('llMenuDash');
    if (dashBtn) dashBtn.addEventListener('click', () => { menu.hidden = true; showOwnerDashboard(); });

    const signupBtn = $('llMenuSignup');
    if (signupBtn) signupBtn.addEventListener('click', () => { menu.hidden = true; injectModal(); });

    const signoutBtn = $('llMenuSignout');
    if (signoutBtn) signoutBtn.addEventListener('click', () => {
      try {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(SCORES_KEY);
      } catch {}
      user = null; isGuest = false; isOwner = false; scores = {};
      wrap.remove();
      injectModal();
    });
  }

  /* ── Progress panel (all users) ─────────────────────────────── */
  function showProgressPanel() {
    const existing = $('llProgressPanel');
    if (existing) { existing.remove(); return; }

    const topics  = window.TOPICS || [];
    const allScr  = scores;
    const done    = topics.filter(t => allScr[t.id] && allScr[t.id].pct >= 50).length;
    const total   = topics.length;
    const avgPct  = Object.values(allScr).length
      ? Math.round(Object.values(allScr).reduce((a,s) => a + (s.pct||0), 0) / Object.values(allScr).length)
      : 0;

    const panel = document.createElement('aside');
    panel.id = 'llProgressPanel';
    panel.setAttribute('aria-label', 'Your progress');
    panel.innerHTML = `
      <div class="ll-prog-header">
        <div>
          <h3 class="ll-prog-title">📊 My Progress</h3>
          <p class="ll-prog-sub">${esc(currentUsername())} · ${isOwner ? 'Owner' : isGuest ? 'Guest session' : 'Saved profile'}</p>
        </div>
        <button class="ll-prog-close" id="llProgClose" aria-label="Close">✕</button>
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
        ${topics.sort((a,b)=>a.id.localeCompare(b.id)).map(t => {
          const s = allScr[t.id];
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

    if (window.LoopLabAI) {
      window.LoopLabAI.analyze(scores, currentUsername(), isGuest)
        .then(text => { $('llAiLoading').remove(); $('llAiBody').innerHTML = text; });
    } else {
      $('llAiLoading').textContent = 'Complete some quizzes to see analysis.';
    }
  }

  /* ── Owner Dashboard ─────────────────────────────────────────── */
  function showOwnerDashboard() {
    const existing = $('llOwnerDash');
    if (existing) { existing.remove(); return; }

    const topics     = window.TOPICS || [];
    const allScores  = load(ALL_SCORES_KEY) || {};
    const myScores   = load(SCORES_KEY) || {};

    // Merge own scores under owner key for display
    if (!allScores[OWNER_USERNAME]) allScores[OWNER_USERNAME] = {};
    Object.assign(allScores[OWNER_USERNAME], myScores);

    const userList   = Object.keys(allScores);
    const totalUsers = userList.length;
    const topicCount = topics.length;

    // Per-topic completion rate across all logged users
    const topicStats = topics.map(t => {
      const answered = userList.filter(u => allScores[u][t.id]);
      const passed   = userList.filter(u => allScores[u][t.id] && allScores[u][t.id].pct >= 50);
      return { ...t, answered: answered.length, passed: passed.length };
    });

    const dash = document.createElement('aside');
    dash.id = 'llOwnerDash';
    dash.setAttribute('aria-label', 'Owner dashboard');
    dash.innerHTML = `
      <div class="ll-prog-header">
        <div>
          <h3 class="ll-prog-title">🛠 Owner Dashboard</h3>
          <p class="ll-prog-sub">Signed in as <strong>${esc(OWNER_USERNAME)}</strong> · Owner</p>
        </div>
        <button class="ll-prog-close" id="llDashClose" aria-label="Close">✕</button>
      </div>

      <!-- Site stats -->
      <div class="ll-owner-section-title">📈 Site Overview</div>
      <div class="ll-prog-stats ll-owner-stats">
        <div class="ll-stat"><span class="ll-stat-num">${totalUsers}</span><span class="ll-stat-label">Profiles</span></div>
        <div class="ll-stat"><span class="ll-stat-num">${topicCount}</span><span class="ll-stat-label">Topics</span></div>
        <div class="ll-stat"><span class="ll-stat-num">${
          userList.length
            ? Math.round(userList.reduce((a,u)=>{
                const sc = Object.values(allScores[u]||{});
                return a + (sc.length ? sc.reduce((x,s)=>x+(s.pct||0),0)/sc.length : 0);
              },0) / userList.length)
            : 0
        }%</span><span class="ll-stat-label">Avg score</span></div>
      </div>

      <!-- Per-topic performance -->
      <div class="ll-owner-section-title">📋 Topic Performance (all users)</div>
      <div class="ll-owner-topic-table">
        <div class="ll-owner-th"><span>Topic</span><span>Attempts</span><span>Pass rate</span><span>Bar</span></div>
        ${topicStats.sort((a,b)=>a.id.localeCompare(b.id)).map(t => {
          const pct = t.answered ? Math.round(t.passed / t.answered * 100) : 0;
          const bar = t.answered ? pct : 0;
          const cls = pct >= 80 ? 'll-bar-green' : pct >= 50 ? 'll-bar-amber' : 'll-bar-red';
          return `<div class="ll-owner-row">
            <span class="ll-owner-topic-name">${esc(t.id)} · ${esc(t.title)}</span>
            <span class="ll-owner-cell">${t.answered}</span>
            <span class="ll-owner-cell">${t.answered ? pct + '%' : '—'}</span>
            <span class="ll-owner-bar-wrap"><span class="ll-owner-bar ${cls}" style="width:${bar}%"></span></span>
          </div>`;
        }).join('')}
      </div>

      <!-- Per-user scores -->
      <div class="ll-owner-section-title">👥 User Scores</div>
      ${userList.length === 0
        ? '<p class="ll-ai-p" style="color:var(--muted)">No user data recorded yet.</p>'
        : userList.map(uname => {
            const uScores = allScores[uname] || {};
            const sc = Object.values(uScores);
            const avg = sc.length ? Math.round(sc.reduce((a,s)=>a+(s.pct||0),0)/sc.length) : 0;
            const done = sc.filter(s=>s.pct>=50).length;
            return `<div class="ll-user-row">
              <div class="ll-user-row-head">
                <span class="ll-user-name">${esc(uname)}</span>
                <span class="ll-user-meta">${done} passed · ${avg}% avg · ${sc.length} topics tried</span>
              </div>
            </div>`;
          }).join('')
      }

      <p class="ll-fine" style="margin-top:20px;text-align:left">
        ℹ️ User data is stored in each user's own browser localStorage. This dashboard reflects data from this device only.
      </p>
    `;
    document.body.appendChild(dash);
    $('llDashClose').addEventListener('click', () => dash.remove());
  }

  /* ── Boot ────────────────────────────────────────────────────── */
  function boot() {
    if (user && user.isOwner && user.name === OWNER_USERNAME) {
      isOwner = true; isGuest = false;
      scores = load(SCORES_KEY) || {};
      renderAvatar();
    } else if (user && user.name && !user.isGuest) {
      isGuest = false; isOwner = false;
      scores = load(SCORES_KEY) || {};
      renderAvatar();
    } else if (user && (user.guestName || user.isGuest)) {
      isGuest = true; isOwner = false;
      scores = {}; // in-memory session only
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
