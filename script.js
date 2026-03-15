const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
// Blocked disposable/fake domains
const blockedDomains = [
  'dd.com', 'test.com', 'fake.com', 'mailinator.com',
  'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'trashmail.com'
];

// ── CAROUSEL ──
const track     = document.getElementById('carousel-track');
const prevBtn   = document.getElementById('carousel-prev');
const nextBtn   = document.getElementById('carousel-next');
const dotsEl    = document.getElementById('carousel-dots');
const cards     = document.querySelectorAll('.carousel-card');
const container = document.querySelector('.carousel-track-container');

let current = 0;
const GAP = 24; // matches 1.5rem gap

function visibleCount() {
  if (window.innerWidth <= 560) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

function totalSlides() {
  return Math.ceil(cards.length / visibleCount());
}

function setCardWidths() {
  const vc = visibleCount();
  const containerWidth = container.offsetWidth;
  const cardWidth = (containerWidth - GAP * (vc - 1)) / vc;
  cards.forEach(card => {
    card.style.width = cardWidth + 'px';
    card.style.minWidth = cardWidth + 'px';
  });
}

function buildDots() {
  dotsEl.innerHTML = '';
  for (let i = 0; i < totalSlides(); i++) {
    const dot = document.createElement('button');
    dot.classList.add('dot');
    if (i === current) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  }
}

function updateDots() {
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === current);
  });
}

function goTo(index) {
  current = Math.max(0, Math.min(index, totalSlides() - 1));
  const vc = visibleCount();
  const containerWidth = container.offsetWidth;
  const cardWidth = (containerWidth - GAP * (vc - 1)) / vc;
  const slideWidth = (cardWidth + GAP) * vc;
  track.style.transform = `translateX(-${current * slideWidth}px)`;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current >= totalSlides() - 1;
  updateDots();
}

prevBtn.addEventListener('click', () => goTo(current - 1));
nextBtn.addEventListener('click', () => goTo(current + 1));

window.addEventListener('resize', () => {
  current = 0;
  setCardWidths();
  buildDots();
  goTo(0);
});

// Init
setCardWidths();
buildDots();
goTo(0);

function isValidEmail(email) {
  // Must have proper format: something@something.tld (min 2 char TLD)
  const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(email)) return false;

  // Block disposable/fake domains
  const domain = email.split('@')[1].toLowerCase();
  if (blockedDomains.includes(domain)) return false;

  return true;
}

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-menu a, .nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// QR Modal
const ghTrigger = document.getElementById('gh-trigger');
const qrOverlay = document.getElementById('qr-overlay');
const qrClose   = document.getElementById('qr-close');

ghTrigger.addEventListener('click', (e) => {
  e.preventDefault();
  qrOverlay.classList.add('open');
});

qrClose.addEventListener('click', () => {
  qrOverlay.classList.remove('open');
});

// Close on backdrop click
qrOverlay.addEventListener('click', (e) => {
  if (e.target === qrOverlay) qrOverlay.classList.remove('open');
});

// Close with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') qrOverlay.classList.remove('open');
});

const contactForm = document.getElementById('contact-form');
const submitBtn   = document.getElementById('submit-btn');
const formToast   = document.getElementById('form-toast');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const emailInput = contactForm.querySelector('input[name="email"]');
  const email = emailInput.value.trim();

  // Validate email
  if (!isValidEmail(email)) {
    formToast.className = 'form-toast error';
    formToast.textContent = '❌ Please enter a valid email address.';
    emailInput.focus();
    setTimeout(() => {
      formToast.className = 'form-toast';
      formToast.textContent = '';
    }, 4000);
    return; 
  }

  const honeypot = contactForm.querySelector('input[name="_gotcha"]');
  if (honeypot && honeypot.value) return; 

  // Button loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  const data = new FormData(contactForm);

  try {
    const response = await fetch('https://formspree.io/f/xaqpdbly', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      // Success
      formToast.className = 'form-toast success';
      formToast.textContent = '✅ Message sent! I\'ll get back to you soon.';
      contactForm.reset();
    } else {
      throw new Error('Failed');
    }
  } catch {
    // Error
    formToast.className = 'form-toast error';
    formToast.textContent = '❌ Something went wrong. Please try emailing me directly.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message →';

    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      formToast.className = 'form-toast';
      formToast.textContent = '';
    }, 5000);
  }
});