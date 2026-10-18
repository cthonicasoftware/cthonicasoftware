document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    typedText.textContent = '';
    let index = 0;

    const complete = () => {
      window.setTimeout(() => {
        caret.classList.add('is-hidden');
        element.classList.remove('is-typing');
        element.dispatchEvent(new CustomEvent('typed:complete'));
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
});
