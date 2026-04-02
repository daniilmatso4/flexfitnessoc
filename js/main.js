// ===== Mobile Menu Toggle =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mainNav = document.getElementById('mainNav');

mobileMenuBtn.addEventListener('click', () => {
  mainNav.classList.toggle('active');
  mobileMenuBtn.classList.toggle('active');
});

// Close mobile menu when a link is clicked
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('active');
    mobileMenuBtn.classList.remove('active');
  });
});

// ===== Sticky Header Shadow =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.5)';
  } else {
    header.style.boxShadow = 'none';
  }
});

// ===== Countdown Timer =====
function startCountdown() {
  // Set offer end date to 7 days from now
  const now = new Date();
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Store end date in localStorage so it persists
  let storedEnd = localStorage.getItem('offerEndDate');
  if (!storedEnd || new Date(storedEnd) < now) {
    localStorage.setItem('offerEndDate', endDate.toISOString());
    storedEnd = endDate.toISOString();
  }

  const targetDate = new Date(storedEnd);

  function update() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('minutes').textContent = '00';
      document.getElementById('seconds').textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

startCountdown();

// ===== Testimonial Slider =====
const track = document.querySelector('.testimonial-track');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentSlide = 0;

function getVisibleCards() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 992) return 2;
  return 3;
}

function updateSlider() {
  const cards = document.querySelectorAll('.testimonial-card');
  const totalCards = cards.length;
  const visible = getVisibleCards();
  const maxSlide = totalCards - visible;

  if (currentSlide > maxSlide) currentSlide = maxSlide;
  if (currentSlide < 0) currentSlide = 0;

  const cardWidth = cards[0].offsetWidth + 30; // card width + gap
  track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
}

prevBtn.addEventListener('click', () => {
  currentSlide--;
  if (currentSlide < 0) currentSlide = 0;
  updateSlider();
});

nextBtn.addEventListener('click', () => {
  const cards = document.querySelectorAll('.testimonial-card');
  const visible = getVisibleCards();
  const maxSlide = cards.length - visible;
  currentSlide++;
  if (currentSlide > maxSlide) currentSlide = maxSlide;
  updateSlider();
});

window.addEventListener('resize', updateSlider);

// ===== Contact Form Handler =====
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(contactForm);
  const name = formData.get('name');
  alert(`Thanks ${name}! We'll be in touch soon. You can also call us at (949) 397-2266.`);
  contactForm.reset();
});

// ===== Smooth Scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerHeight = document.querySelector('.header').offsetHeight;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  });
});
