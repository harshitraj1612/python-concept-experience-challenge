/**
 * Loop Lab — Dark & Light Theme System
 * Handles theme detection, persistence, instant application without flash,
 * and renders a smooth Sun/Moon toggle button in the header across all pages.
 */
(() => {
  const THEME_KEY = 'looplab_theme';
  const QUEST_KEY = 'loop_quest_prefs_v1';

  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;

      // Sync with Loop Quest if already set there
      const rawQuest = localStorage.getItem(QUEST_KEY);
      if (rawQuest) {
        const q = JSON.parse(rawQuest);
        if (q.theme === 'dark' || q.theme === 'light') return q.theme;
      }
    } catch (e) {}

    // System default
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#0e1522' : '#f5f4ef');
    }
    updateButtonVisual(theme);
    window.dispatchEvent(new CustomEvent('looplab-theme-change', { detail: { theme } }));
  }

  function setTheme(theme) {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
      // Sync back to Loop Quest
      const raw = localStorage.getItem(QUEST_KEY);
      const q = raw ? JSON.parse(raw) : {};
      q.theme = theme;
      localStorage.setItem(QUEST_KEY, JSON.stringify(q));
    } catch (e) {}
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  function updateButtonVisual(theme) {
    const btn = document.getElementById('llThemeToggle');
    if (!btn) return;
    const isDark = theme === 'dark';
    btn.setAttribute('aria-label', isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme');
    btn.title = isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme';

    const iconWrap = btn.querySelector('.ll-theme-icon');
    if (iconWrap) {
      iconWrap.innerHTML = isDark
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
             <circle cx="12" cy="12" r="5"></circle>
             <line x1="12" y1="1" x2="12" y2="3"></line>
             <line x1="12" y1="21" x2="12" y2="23"></line>
             <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
             <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
             <line x1="1" y1="12" x2="3" y2="12"></line>
             <line x1="21" y1="12" x2="23" y2="12"></line>
             <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
             <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
           </svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
             <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
           </svg>`;
    }
  }

  function mountToggleButton() {
    if (document.getElementById('llThemeToggle')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'llThemeToggle';
    btn.className = 'll-theme-toggle';
    btn.innerHTML = `<span class="ll-theme-icon" aria-hidden="true"></span>`;
    btn.addEventListener('click', toggleTheme);

    // Mount location
    const links = document.querySelector('.links');
    const avatar = document.querySelector('.ll-avatar-wrap');
    if (links) {
      if (avatar && avatar.parentNode === links) {
        links.insertBefore(btn, avatar);
      } else {
        links.appendChild(btn);
      }
    } else {
      const topbar = document.querySelector('.topbar');
      if (topbar) {
        if (avatar && avatar.parentNode === topbar) {
          topbar.insertBefore(btn, avatar);
        } else {
          topbar.appendChild(btn);
        }
      }
    }

    const current = document.documentElement.getAttribute('data-theme') || 'light';
    updateButtonVisual(current);
  }

  // Initial sync
  const initialTheme = getSavedTheme();
  applyTheme(initialTheme);

  // Mount on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountToggleButton);
  } else {
    mountToggleButton();
  }

  // OS theme change listener
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      try {
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      } catch (err) {}
    });
  }

  window.LoopLabTheme = {
    get: () => document.documentElement.getAttribute('data-theme') || 'light',
    set: setTheme,
    toggle: toggleTheme
  };
})();
