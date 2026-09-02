/*
 * Shared chrome behaviour: footer year, and in-page anchor scrolling that
 * closes the mobile nav on the way.
 *
 * This used to exist three times over (base/product.html, website/pricing.html
 * and website-index.js), and the copies had already drifted apart. It lives
 * here once, and loads on every page from base/site.html.
 *
 * Opening and closing the nav itself is Flowbite Collapse's job — see
 * data-collapse-toggle in the templates.
 */
(function () {
  var year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  function closeMobileNav() {
    // Go through Flowbite rather than toggling `hidden` directly: the Collapse
    // instance tracks its own visibility, and a class set behind its back
    // leaves the next click on the toggle doing nothing.
    var collapse =
      window.FlowbiteInstances &&
      window.FlowbiteInstances.getInstance('Collapse', 'mobileNav');
    if (collapse) {
      collapse.collapse();
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      var href = anchor.getAttribute('href');
      var target = href && href.length > 1 ? document.querySelector(href) : null;
      // Resolve the target before suppressing the default. Doing it the other
      // way round leaves a bare `#` link silently doing nothing at all.
      if (!target) {
        return;
      }
      event.preventDefault();
      closeMobileNav();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
