const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
// Blocked disposable/fake domains
const blockedDomains = [
  'dd.com', 'test.com', 'fake.com', 'mailinator.com',
  'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'trashmail.com'
];

// ── QR GENERATOR APP MODAL ──
const qrAppOverlay   = document.getElementById('qr-app-overlay');
const qrAppTrigger   = document.getElementById('qr-app-trigger');
const qrAppClose     = document.getElementById('qr-app-close');
const qrAppInput     = document.getElementById('qr-app-input');
const qrAppGenerate  = document.getElementById('qr-app-generate');
const qrAppOutput    = document.getElementById('qr-app-output');
const qrAppContainer = document.getElementById('qr-app-canvas-container');
const qrAppDownload  = document.getElementById('qr-app-download');
const qrAppClear     = document.getElementById('qr-app-clear');
const qrAppMsg       = document.getElementById('qr-app-msg');
let appQrCode = null;

// Load QRCode.js only when needed
function loadQRLib(callback) {
  if (window.QRCode) { callback(); return; }
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  script.onload = callback;
  document.head.appendChild(script);
}

qrAppTrigger.addEventListener('click', (e) => {
  e.preventDefault();
  qrAppOverlay.classList.add('open');
  loadQRLib(() => {});
  setTimeout(() => qrAppInput.focus(), 100);
});

qrAppClose.addEventListener('click', () => qrAppOverlay.classList.remove('open'));
qrAppOverlay.addEventListener('click', (e) => {
  if (e.target === qrAppOverlay) qrAppOverlay.classList.remove('open');
});

qrAppGenerate.addEventListener('click', generateAppQR);
qrAppInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') generateAppQR();
});

function generateAppQR() {
  const text = qrAppInput.value.trim();
  if (!text) {
    qrAppMsg.style.color = '#ff8080';
    qrAppMsg.textContent = '❌ Please enter text or URL';
    return;
  }
  qrAppContainer.innerHTML = '';
  loadQRLib(() => {
    appQrCode = new QRCode(qrAppContainer, {
      text: text,
      width: 200, height: 200,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
    qrAppOutput.style.display = 'flex';
    qrAppMsg.style.color = 'var(--accent2)';
    qrAppMsg.textContent = '✅ QR code generated!';
  });
}

qrAppDownload.addEventListener('click', () => {
  const canvas = qrAppContainer.querySelector('canvas');
  if (!canvas) return;
  canvas.toBlob((blob) => {
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qrcode_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    qrAppMsg.textContent = '✅ Downloaded!';
  });
});

qrAppClear.addEventListener('click', () => {
  qrAppInput.value = '';
  qrAppContainer.innerHTML = '';
  qrAppOutput.style.display = 'none';
  qrAppMsg.textContent = '';
  appQrCode = null;
  qrAppInput.focus();
});

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