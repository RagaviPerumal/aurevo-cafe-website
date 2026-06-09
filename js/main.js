if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

const sliderIntervals = [];
const sliderAborts = [];

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

function destroySliders() {
  sliderIntervals.forEach((id) => clearInterval(id));
  sliderIntervals.length = 0;
  sliderAborts.forEach((ac) => ac.abort());
  sliderAborts.length = 0;

  document.querySelectorAll('[data-slider]').forEach((sliderEl) => {
    const dots = sliderEl.querySelector('.slider__dots');
    if (dots) dots.innerHTML = '';
  });
}

function initSliders() {
  if (!document.querySelector('[data-slider]')) return;

  destroySliders();

  const DEFAULT_AUTOPLAY = 5000;

  document.querySelectorAll('[data-slider]').forEach((sliderEl) => {
    const ac = new AbortController();
    const { signal } = ac;
    sliderAborts.push(ac);

    const slides = [...sliderEl.querySelectorAll('.slider__slide')];
    const prevBtn = sliderEl.querySelector('.slider__arrow--prev');
    const nextBtn = sliderEl.querySelector('.slider__arrow--next');
    const dotsContainer = sliderEl.querySelector('.slider__dots');
    const autoplayDelay = parseInt(sliderEl.dataset.autoplay, 10) || DEFAULT_AUTOPLAY;

    if (slides.length === 0) return;

    slides.forEach((slide) => slide.classList.remove('slider__slide--active'));

    let current = 0;
    slides[0].classList.add('slider__slide--active');

    const dots = [];
    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider__dot' + (i === 0 ? ' slider__dot--active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i), { signal });
        dotsContainer.appendChild(dot);
        dots.push(dot);
      });
    }

    function restartKenBurns(slide) {
      const bg = slide.querySelector('.hero-slider__bg');
      if (!bg) return;
      bg.style.animation = 'none';
      void bg.offsetWidth;
      bg.style.animation = '';
    }

    function goTo(index) {
      slides[current].classList.remove('slider__slide--active');
      if (dots[current]) dots[current].classList.remove('slider__dot--active');

      current = ((index % slides.length) + slides.length) % slides.length;

      slides[current].classList.add('slider__slide--active');
      if (dots[current]) dots[current].classList.add('slider__dot--active');
      restartKenBurns(slides[current]);
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    prevBtn?.addEventListener('click', prev, { signal });
    nextBtn?.addEventListener('click', next, { signal });

    let touchStartX = 0;
    sliderEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true, signal });

    sliderEl.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
      }
    }, { passive: true, signal });

    const intervalId = setInterval(next, autoplayDelay);
    sliderIntervals.push(intervalId);
  });
}

window.addEventListener('pageshow', () => {
  if (document.querySelector('[data-slider]')) {
    initSliders();
  }
});
