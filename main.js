import './style.css';

/**
 * Elektrofuzzy Canvas Scrollytelling Animation
 * Using a 110-frame image sequence inside /@frame/
 */

const frameCount = 111; // 000 to 110 inclusive
const pad = (n) => n.toString().padStart(3, '0');
const getFramePath = (index) => `/@frame/frame_${pad(index)}_delay-0.033s.jpg`;

const canvas = document.getElementById('lightbulb-canvas');
const context = canvas.getContext('2d', { alpha: false });

let frames = [];
let loadedCount = 0;
let initialRenderDone = false;

// Scrolling State using Spring/Lerp
const scrollState = {
  currentFrame: 0,
  targetFrame: 0,
  ease: 0.12 // Tighter lerp factor to match the shorter 320vh scroll distance
};

// 1. Resize Canvas to fill viewport while maintaining image aspect ratio using object-fit: cover semantics
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (initialRenderDone) {
    renderFrame(Math.round(scrollState.currentFrame));
  }
}

// 2. Render Single Frame
function renderFrame(index) {
  if (frames[index] && frames[index].complete) {
    const img = frames[index];
    
    // object-fit: cover implementation on Canvas
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = canvas.width / 2 - w / 2;
    const y = canvas.height / 2 - h / 2;

    context.fillStyle = '#050505';
    context.fillRect(0, 0, canvas.width, canvas.height); // clear background
    context.drawImage(img, x, y, w, h);
  }
}

// 3. Preload all 111 image frames efficiently
function preloadImages() {
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = getFramePath(i);
    img.onload = () => {
      loadedCount++;
      
      // Render the very first loaded frame immediately (usually 0) to avoid blank screens
      if (i === 0) {
        initialRenderDone = true;
        resizeCanvas(); 
      }
      
      // Once all assets are fully buffered, start the loop (though we can start it earlier too)
      if (loadedCount === frameCount) {
        console.log("All 111 Old Vienna frames loaded successfully.");
      }
    };
    frames.push(img);
  }
}

// 4. Listen to scroll events to update our target frame
const header = document.getElementById('main-header');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  
  // Toggle Header Sticky Styling
  if (scrollY > 60) {
    header.classList.add('header-scrolled');
  } else {
    header.classList.remove('header-scrolled');
  }

  // Calculate relative to raw document minus viewport
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  
  // Progress ratio 0.0 to 1.0
  const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
  
  // Map progress to target image frame
  scrollState.targetFrame = Math.min(Math.floor(progress * frameCount), frameCount - 1);
}, { passive: true });

// 5. Native Animation Loop using linear interpolation (lerp)
function update() {
  // Move current frame closer to target frame continuously
  scrollState.currentFrame += (scrollState.targetFrame - scrollState.currentFrame) * scrollState.ease;
  
  // Only render integer values to valid frames
  const renderIndex = Math.round(scrollState.currentFrame);
  if (initialRenderDone) {
    renderFrame(renderIndex);
  }
  
  requestAnimationFrame(update);
}

// Handle responsive resizing
window.addEventListener('resize', resizeCanvas);

// Setup IntersectionObservers for Scrollytelling Glass Panels
function setupObservers() {
  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -10% 0px',
    threshold: 0.15 // trigger when 15% visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('beat-visible');
      } else {
        // Optional: comment out below line if panels should remain visible once revealed
        entry.target.classList.remove('beat-visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.beat').forEach(section => {
    observer.observe(section);
  });
}

// Setup Mobile Navigation Menu
function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIconPath = document.getElementById('menu-icon-path');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  
  let isMenuOpen = false;

  const toggleMenu = () => {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
      mobileMenu.classList.remove('-translate-y-full');
      // Change to X icon
      menuIconPath.setAttribute('d', 'M6 18L18 6M6 6l12 12');
    } else {
      mobileMenu.classList.add('-translate-y-full');
      // Change back to Hamburger icon
      menuIconPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    }
  };

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMenu);
  }

  // Close menu when a link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isMenuOpen) toggleMenu();
    });
  });
}

// Initialization Sequence
document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas(); // Ensure bounds are correct prior to load
  preloadImages();
  setupObservers();
  setupMobileMenu();
  requestAnimationFrame(update); // Start render loop
});
