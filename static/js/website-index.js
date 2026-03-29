document.addEventListener('DOMContentLoaded', () => {
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const revealStep = (selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => element.classList.add('is-visible'));
    return elements;
  };
  const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value);

  const year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const navBtn = document.getElementById('navBtn');
  const mobileNav = document.getElementById('mobileNav');

  navBtn?.addEventListener('click', () => {
    const next = !mobileNav?.classList.contains('is-open');
    mobileNav?.classList.toggle('is-open', next);
    navBtn.setAttribute('aria-expanded', String(next));
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      const href = anchor.getAttribute('href');
      const target = href ? document.querySelector(href) : null;
      if (!target) {
        return;
      }

      mobileNav?.classList.remove('is-open');
      navBtn?.setAttribute('aria-expanded', 'false');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('.final-cta-path').forEach((card) => {
    let rafId = null;
    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;
    let isHovering = false;

    const animate = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      currentX += dx * 0.18;
      currentY += dy * 0.18;

      card.style.setProperty('--pointer-x', `${currentX}%`);
      card.style.setProperty('--pointer-y', `${currentY}%`);

      if (isHovering || Math.abs(dx) + Math.abs(dy) > 0.03) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    };

    const queueAnimation = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const updateTarget = (event) => {
      const rect = card.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width) * 100;
      targetY = ((event.clientY - rect.top) / rect.height) * 100;
      queueAnimation();
    };

    card.addEventListener('mouseenter', updateTarget);
    card.addEventListener('mousemove', updateTarget);
    card.addEventListener('mouseleave', () => {
      isHovering = false;
    });
    card.addEventListener('mouseenter', () => {
      isHovering = true;
    });
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const typedAnimations = [];

  document.querySelectorAll('[data-typed-text]').forEach((element) => {
    const typedText = element.querySelector('.hero-title-typed');
    const caret = element.querySelector('.hero-title-caret, .typed-caret');
    const fullText = element.getAttribute('data-typed-text') ?? '';
    const startDelay = Number(element.getAttribute('data-typed-delay') ?? '300');

    if (!typedText || !caret || !fullText) {
      return;
    }

    if (prefersReducedMotion) {
      typedText.textContent = fullText;
      caret.classList.add('is-hidden');
      element.classList.remove('is-typing');
      element.dispatchEvent(new CustomEvent('typed:complete'));
      return;
    }

    const animation = new Promise((resolve) => {
      typedText.textContent = '';
      let index = 0;

      const complete = () => {
        window.setTimeout(() => {
          caret.classList.add('is-hidden');
          element.classList.remove('is-typing');
          element.dispatchEvent(new CustomEvent('typed:complete'));
          resolve();
        }, 500);
      };

      const step = () => {
        index += 1;
        typedText.textContent = fullText.slice(0, index);

        if (index < fullText.length) {
          const currentChar = fullText[index - 1];
          const delay = currentChar === ',' ? 170 : currentChar === ' ' ? 55 : 85;
          window.setTimeout(step, delay);
          return;
        }

        complete();
      };

      window.setTimeout(step, startDelay);
    });

    typedAnimations.push(animation);
  });

  const progressFill = document.querySelector('.instr-prog-fill[data-progress-target]');
  const progressNote = document.querySelector('.instr-prog-note[data-rows-target][data-progress-target]');
  const passBadge = document.querySelector('.instr-pass[data-demo-step="analysis-pass"]');

  const animateCaptureProgress = () => {
    if (!progressFill || !progressNote) {
      return Promise.resolve();
    }

    const targetRows = Number(progressNote.getAttribute('data-rows-target') ?? '0');
    const targetPercent = Number(progressNote.getAttribute('data-progress-target') ?? '0');

    progressFill.style.width = `${targetPercent}%`;
    progressFill.classList.add('is-active');

    if (prefersReducedMotion) {
      progressNote.textContent = `${formatNumber(targetRows)} rows · ${targetPercent}%`;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const start = performance.now();
      const duration = 1300;

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const rows = Math.round(targetRows * eased);
        const percent = Math.round(targetPercent * eased);
        progressNote.textContent = `${formatNumber(rows)} rows · ${percent}%`;

        if (progress < 1) {
          window.requestAnimationFrame(tick);
          return;
        }

        resolve();
      };

      window.requestAnimationFrame(tick);
    });
  };

  const startInstrumentDemo = async () => {
    revealStep('[data-demo-step="capture-meta"]');
    await wait(prefersReducedMotion ? 0 : 220);
    revealStep('[data-demo-step="capture-progress"]');
    await animateCaptureProgress();
    await wait(prefersReducedMotion ? 0 : 180);
    revealStep('[data-demo-step="capture-tags"]');
    await wait(prefersReducedMotion ? 0 : 220);
    revealStep('[data-demo-step="upload"]');
    await wait(prefersReducedMotion ? 0 : 520);
    revealStep('[data-demo-step="analysis-1"]');
    await wait(prefersReducedMotion ? 0 : 220);
    revealStep('[data-demo-step="analysis-2"]');
    await wait(prefersReducedMotion ? 0 : 220);
    revealStep('[data-demo-step="analysis-3"]');
    await wait(prefersReducedMotion ? 0 : 160);
    revealStep('[data-demo-step="analysis-tags"]');
    revealStep('[data-demo-step="analysis-pass"]');
    passBadge?.classList.add('is-live');
  };

  const commandElement = document.querySelector('.instr-cmd[data-typed-text]');
  if (commandElement) {
    if (prefersReducedMotion) {
      startInstrumentDemo();
    } else {
      commandElement.addEventListener(
        'typed:complete',
        () => {
          startInstrumentDemo();
        },
        { once: true }
      );
    }
  }

  Promise.all(typedAnimations).catch(() => {});
});
