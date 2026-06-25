(() => {
  const root = document.documentElement;
  const body = document.body;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const navLinks = document.querySelector('.nav-links');
  const siteHeader = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress');
  const toast = document.querySelector('.toast');

  // Theme: use saved choice first, then system preference.
  const savedTheme = localStorage.getItem('restaurant-theme');
  const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  root.dataset.theme = savedTheme || preferredTheme;

  function updateThemeIcon() {
    if (!themeToggle) return;
    const isLight = root.dataset.theme === 'light';
    themeToggle.textContent = isLight ? '☾' : '☀';
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    themeToggle.title = isLight ? 'Dark mode' : 'Light mode';
  }
  updateThemeIcon();

  themeToggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('restaurant-theme', root.dataset.theme);
    updateThemeIcon();
  });

  // Mobile menu.
  menuToggle?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.textContent = isOpen ? '✕' : '☰';
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    if (menuToggle) menuToggle.textContent = '☰';
  }));

  // Mark the current page in the navigation.
  const currentPage = body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach(link => {
    if (link.dataset.nav === currentPage) link.classList.add('active');
  });

  // Header styling, progress bar and parallax.
  const heroBackgrounds = document.querySelectorAll('.hero-bg');
  function onScroll() {
    const y = window.scrollY;
    siteHeader?.classList.toggle('scrolled', y > 24);

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${maxScroll > 0 ? (y / maxScroll) * 100 : 0}%`;

    heroBackgrounds.forEach(bg => {
      const parent = bg.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        bg.style.transform = `translate3d(0, ${Math.max(-40, y * 0.11)}px, 0) scale(1.08)`;
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal-on-scroll animations.
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Animated statistics.
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || '';
      const duration = 1200;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  // Skill bars on About page.
  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .45 });
  document.querySelectorAll('.skill-fill').forEach(el => skillObserver.observe(el));

  // Food category filtering.
  const filterButtons = document.querySelectorAll('.filter-btn');
  const menuItems = document.querySelectorAll('.menu-item');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      menuItems.forEach(item => {
        const shouldShow = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !shouldShow);
      });
    });
  });

  // Gallery lightbox.
  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  document.querySelectorAll('.gallery-item img').forEach(image => {
    image.addEventListener('click', () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      lightbox.classList.add('open');
      body.style.overflow = 'hidden';
    });
  });
  function closeLightbox() {
    lightbox?.classList.remove('open');
    body.style.overflow = '';
  }
  lightbox?.addEventListener('click', event => {
    if (event.target === lightbox || event.target.closest('[data-lightbox-close]')) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLightbox();
  });

  // Demo reservation/contact form. This validates locally; connect it to a backend later.
  const reservationForm = document.querySelector('#reservationForm');
  reservationForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!reservationForm.checkValidity()) {
      reservationForm.reportValidity();
      return;
    }
    const name = reservationForm.querySelector('[name="name"]')?.value.trim() || 'Guest';
    showToast(`Thank you, ${name}. Your request has been recorded in this demo.`);
    reservationForm.reset();
  });

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 3800);
  }

  // Update copyright year.
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
