// Injects a "Reset prototype" button pinned to the top-right of every page.
// Clicking it clears all prototype localStorage and returns to the entry page.
(function () {
  function mount() {
    if (document.getElementById('pd-reset-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'pd-reset-btn';
    btn.type = 'button';
    btn.textContent = 'Reset prototype';
    btn.setAttribute('aria-label', 'Reset prototype');
    btn.style.cssText = [
      'position: fixed',
      'top: 16px',
      'right: 16px',
      'z-index: 9999',
      'padding: 8px 14px',
      'background: rgba(17, 24, 39, 0.78)',
      'color: #FFFFFF',
      'border: none',
      'border-radius: 6px',
      'font-size: 12px',
      'font-weight: 600',
      'letter-spacing: 0.01em',
      'cursor: pointer',
      "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
      'box-shadow: 0 1px 3px rgba(0,0,0,0.18)',
      'transition: background 0.15s',
    ].join(';');

    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(17, 24, 39, 0.95)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(17, 24, 39, 0.78)';
    });

    btn.addEventListener('click', () => {
      if (!window.confirm('Reset the prototype? This clears all entered data.')) return;
      try {
        // Known key from the early signup flow
        localStorage.removeItem('pd_mvp_store');
        // Sweep any core-app versions (pd_core_app, pd_core_app_v2, _v3, _v4, …)
        Object.keys(localStorage)
          .filter((k) => k.startsWith('pd_core_app'))
          .forEach((k) => localStorage.removeItem(k));
      } catch {}
      window.location.href = 'pricing.html';
    });

    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
