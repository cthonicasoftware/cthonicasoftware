document.addEventListener('DOMContentLoaded', () => {
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
});
