(function () {
  // Button + icons
  const btn  = document.getElementById('theme-toggle');
  const icoD = document.getElementById('theme-toggle-dark-icon');
  const icoL = document.getElementById('theme-toggle-light-icon');
  if (!btn || !icoD || !icoL) return;

  // Find the app wrapper
  const root = btn.closest('.app') || document.querySelector('body.app');
  if (!root) return;

  // Unified storage key
  const key = 'app-theme';

  // Helpers
  const isSystemDark = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const apply = (mode) => {
    root.classList.toggle('dark', mode === 'dark');
    document.documentElement.classList.toggle('dark', mode === 'dark');
    if (mode === 'dark') {
      icoL.classList.remove('hidden');
      icoD.classList.add('hidden');
    } else {
      icoD.classList.remove('hidden');
      icoL.classList.add('hidden');
    }
  };

  // Initial state: stored → system → light
  const stored = localStorage.getItem(key);
  if (stored === 'dark' || stored === 'light') {
    apply(stored);
  } else {
    apply(isSystemDark() ? 'dark' : 'light');
  }

  // Toggle handler
  btn.addEventListener('click', () => {
    const next = root.classList.contains('dark') ? 'light' : 'dark';
    apply(next);
    localStorage.setItem(key, next);
  });

  // React to system changes only if no stored pref
  if (!stored && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => apply(e.matches ? 'dark' : 'light');
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(onChange);
    }
  }
})();
