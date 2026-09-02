document.addEventListener('DOMContentLoaded', () => {
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
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

  const getTerminalTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');

    if (isDark) {
      return {
        background: 'rgba(0, 0, 0, 0)',
        foreground: '#f2e9de',
        cursor: '#5e8570',
        cursorAccent: '#0f0d0d',
        selectionBackground: 'rgba(198, 166, 100, 0.22)',
        black: '#0f0d0d',
        red: '#d98c7a',
        green: '#7fa489',
        yellow: '#c6a664',
        blue: '#8ca3b5',
        magenta: '#b59ac6',
        cyan: '#7aa0a5',
        white: '#f2e9de',
        brightBlack: '#776c60',
        brightRed: '#e5a695',
        brightGreen: '#98b8a0',
        brightYellow: '#dcc287',
        brightBlue: '#a7bccd',
        brightMagenta: '#ccb2de',
        brightCyan: '#9ac0c5',
        brightWhite: '#fff8ef',
      };
    }

    return {
      background: 'rgba(0, 0, 0, 0)',
      foreground: '#342714',
      cursor: '#345841',
      cursorAccent: '#f6edd9',
      selectionBackground: 'rgba(120, 86, 28, 0.18)',
      black: '#2e2418',
      red: '#9d5748',
      green: '#345841',
      yellow: '#78561c',
      blue: '#5f7489',
      magenta: '#876996',
      cyan: '#527279',
      white: '#efe1c6',
      brightBlack: '#7f6b4a',
      brightRed: '#b76b5b',
      brightGreen: '#467257',
      brightYellow: '#967234',
      brightBlue: '#768ca0',
      brightMagenta: '#9d83ab',
      brightCyan: '#678c92',
      brightWhite: '#fff8ef',
    };
  };

  const initHeroTerminal = async () => {
    const terminalNode = document.getElementById('heroTerminal');
    if (!terminalNode) {
      return;
    }

    try {
      const TerminalCtor = window.Terminal;
      const FitAddonCtor = window.FitAddon?.FitAddon ?? window.FitAddon;

      if (!TerminalCtor || !FitAddonCtor) {
        throw new Error('xterm globals unavailable');
      }

      const term = new TerminalCtor({
        allowTransparency: true,
        convertEol: true,
        cursorBlink: !prefersReducedMotion,
        cursorStyle: 'bar',
        disableStdin: true,
        fontFamily: '"Cascadia Code", "CaskaydiaCove Nerd Font", monospace',
        fontSize: 12.5,
        lineHeight: 1.4,
        rows: 16,
        scrollback: 100,
        theme: getTerminalTheme(),
      });

      const fitAddon = new FitAddonCtor();
      term.loadAddon(fitAddon);
      term.open(terminalNode);
      terminalNode.classList.add('is-ready');

      const fitTerminal = () => {
        window.requestAnimationFrame(() => {
          try {
            fitAddon.fit();
          } catch (error) {
            // Layout may not be ready on the first frame.
          }
        });
      };

      fitTerminal();

      const resizeObserver = new ResizeObserver(() => {
        fitTerminal();
      });
      resizeObserver.observe(terminalNode);

      document.fonts?.ready.then(() => {
        fitTerminal();
      }).catch(() => {});

      const themeObserver = new MutationObserver(() => {
        term.options.theme = getTerminalTheme();
        fitTerminal();
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });

      const type = async (text, delay = 34) => {
        if (prefersReducedMotion) {
          term.write(text);
          return;
        }

        for (const char of text) {
          term.write(char);
          await wait(char === ' ' ? 14 : delay);
        }
      };

      const command = async (text) => {
        term.write('\x1b[38;2;94;133;112m$ \x1b[0m');
        await type(text);
        term.write('\r\n');
      };

      const line = async (text, delay = 0) => {
        term.writeln(text);
        if (delay > 0 && !prefersReducedMotion) {
          await wait(delay);
        }
      };

      const progressLine = async (label, steps = [0, 28, 57, 81, 100]) => {
        const render = (percent) => {
          const filled = Math.round((percent / 100) * 16);
          const empty = 16 - filled;
          const bar = `${'='.repeat(filled)}${'-'.repeat(Math.max(0, empty))}`;
          return `\x1b[38;2;198;166;100m>\x1b[0m ${label} [${bar}] ${String(percent).padStart(3, ' ')}%`;
        };

        if (prefersReducedMotion) {
          term.writeln(render(100));
          return;
        }

        term.write(render(steps[0]));
        for (const percent of steps.slice(1)) {
          await wait(percent === 100 ? 180 : 140);
          term.write(`\r\x1b[2K${render(percent)}`);
        }
        term.write('\r\n');
      };

      const checks = [
        'directory_exists',
        'manifest_parse',
        'manifest_fields',
        'data_exists',
        'data_ndjson',
        'data_checksum',
        'records_count',
        'timestamps',
        'upload_state',
      ];

      const validateCommand = 'astrolabe validate ~/.astrolabe/runs/01KJRMFPC9SFXW/';
      term.write('\x1b[38;2;94;133;112m$ \x1b[0m');
      await type(validateCommand, 26);
      term.write('\r\n');
      await line('\x1b[38;2;94;133;112m$ \x1b[0m Validating run directory: ~/.astrolabe/runs/01KJRMFPC9SFXW/', 220);

      for (const item of checks) {
        await line(`\x1b[38;2;94;133;112m[ok]\x1b[0m ${item}`, 70);
      }

      await line('\x1b[38;2;94;133;112m[ok]\x1b[0m Validation passed for run 01KJRMFPC9SFXW', 140);
      await command('astrolabe upload --run-id 01KJRMFPC9SFXW');
      await line('\x1b[2m run_id\x1b[0m  01J8KX3P7Q9M4VSB', 90);
      await line('\x1b[2m capture\x1b[0m  12,847 rows [100%]  \x1b[38;2;94;133;112m[ok]\x1b[0m local artifacts sealed', 100);
      await progressLine('uploading to Orrery');
      await line('\x1b[38;2;94;133;112m[pass]\x1b[0m normalized - 12,847 rows - schema v3', 90);
      await wait(prefersReducedMotion ? 0 : 15000);
      await line('\x1b[38;2;94;133;112m[pass]\x1b[0m AI analysis complete - 4 insights surfaced', 90);
      await line('\x1b[38;2;198;166;100mtags\x1b[0m queryable  traceable  defensible');

      term.scrollToBottom();
      fitTerminal();
    } catch (error) {
      terminalNode.textContent = 'Terminal demo unavailable.';
      terminalNode.classList.add('is-fallback');
    }
  };

  Promise.all(typedAnimations)
    .catch(() => {})
    .finally(() => {
      initHeroTerminal();
    });
});
