/*
 * Theme toggle.
 *
 * Flowbite documents dark mode as a copy-paste snippet; it ships no dark-mode
 * code in flowbite.min.js (`color-theme` and `theme-toggle` appear nowhere in
 * the bundle), so this file is the one implementation rather than a duplicate
 * of one. It deliberately does NOT re-resolve the initial theme: the blocking
 * script in base/site.html already did that before first paint. This only
 * mirrors the resolved state onto the icons and handles the click.
 */
(function () {
  var btn = document.getElementById('theme-toggle');
  var icoDark = document.getElementById('theme-toggle-dark-icon');
  var icoLight = document.getElementById('theme-toggle-light-icon');
  if (!btn || !icoDark || !icoLight) return;

  var KEY = 'app-theme';
  var root = document.documentElement;

  function render() {
    var isDark = root.classList.contains('dark');
    // Show the icon for the mode a click would switch *to*.
    icoLight.classList.toggle('hidden', !isDark);
    icoDark.classList.toggle('hidden', isDark);
  }

  function apply(mode) {
    root.classList.toggle('dark', mode === 'dark');
    render();
  }

  render();

  btn.addEventListener('click', function () {
    var next = root.classList.contains('dark') ? 'light' : 'dark';
    apply(next);
    localStorage.setItem(KEY, next);
  });

  // Follow the OS only while the user has expressed no preference of their own.
  if (!localStorage.getItem(KEY) && window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (e) { apply(e.matches ? 'dark' : 'light'); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
})();
