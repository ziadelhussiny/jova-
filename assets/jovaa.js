class JovaaScroller extends HTMLElement {
  connectedCallback() {
    this.scroller = this.querySelector('[data-jovaa-track]');
    this.previousButton = this.querySelector('[data-jovaa-previous]');
    this.nextButton = this.querySelector('[data-jovaa-next]');

    if (!this.scroller || !this.previousButton || !this.nextButton) return;

    this.previousButton.addEventListener('click', () => this.scroll(-1));
    this.nextButton.addEventListener('click', () => this.scroll(1));
    this.scroller.addEventListener('scroll', () => this.updateButtons(), { passive: true });
    this.updateButtons();
  }

  scroll(direction) {
    const item = this.scroller.querySelector(':scope > *');
    const distance = item ? item.getBoundingClientRect().width + 16 : this.scroller.clientWidth;
    const rtlDirection = document.documentElement.dir === 'rtl' ? -1 : 1;
    this.scroller.scrollBy({ left: distance * direction * rtlDirection, behavior: 'smooth' });
  }

  updateButtons() {
    const maxScroll = this.scroller.scrollWidth - this.scroller.clientWidth;
    const current = Math.abs(this.scroller.scrollLeft);
    this.previousButton.disabled = current <= 2;
    this.nextButton.disabled = current >= maxScroll - 2;
  }
}

if (!customElements.get('jovaa-scroller')) {
  customElements.define('jovaa-scroller', JovaaScroller);
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!prefersReducedMotion.matches && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  document.querySelectorAll('[data-jovaa-reveal]').forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll('[data-jovaa-reveal]').forEach((element) => element.classList.add('is-visible'));
}
