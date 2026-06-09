document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.header__toggle');
  const nav = document.querySelector('.header__nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }

  document.querySelectorAll('.contact-form form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Message Sent!';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        form.reset();
      }, 2500);
    });
  });

  initSliders();
});

function initSliders() {
  const DEFAULT_AUTOPLAY = 5000;

  document.querySelectorAll('[data-slider]').forEach((sliderEl) => {
    const slides = [...sliderEl.querySelectorAll('.slider__slide')];
    const prevBtn = sliderEl.querySelector('.slider__arrow--prev');
    const nextBtn = sliderEl.querySelector('.slider__arrow--next');
    const dotsContainer = sliderEl.querySelector('.slider__dots');
    const autoplayDelay = parseInt(sliderEl.dataset.autoplay, 10) || DEFAULT_AUTOPLAY;

    if (slides.length === 0) return;

    let current = slides.findIndex((s) => s.classList.contains('slider__slide--active'));
    if (current < 0) {
      current = 0;
      slides[0].classList.add('slider__slide--active');
    }

    const dots = [];
    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider__dot' + (i === current ? ' slider__dot--active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
        dots.push(dot);
      });
    }

    let autoplayTimer = null;
    let isPaused = false;

    function goTo(index) {
      slides[current].classList.remove('slider__slide--active');
      if (dots[current]) dots[current].classList.remove('slider__dot--active');

      current = ((index % slides.length) + slides.length) % slides.length;

      slides[current].classList.add('slider__slide--active');
      if (dots[current]) dots[current].classList.add('slider__dot--active');

      restartAutoplay();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      if (autoplayDelay > 0 && !isPaused) {
        autoplayTimer = setInterval(next, autoplayDelay);
      }
    }

    function restartAutoplay() {
      startAutoplay();
    }

    function pauseAutoplay() {
      isPaused = true;
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    function resumeAutoplay() {
      isPaused = false;
      startAutoplay();
    }

    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);

    sliderEl.addEventListener('mouseenter', pauseAutoplay);
    sliderEl.addEventListener('mouseleave', resumeAutoplay);

    let touchStartX = 0;
    sliderEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      pauseAutoplay();
    }, { passive: true });

    sliderEl.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
      }
      resumeAutoplay();
    }, { passive: true });

    startAutoplay();
  });
}
