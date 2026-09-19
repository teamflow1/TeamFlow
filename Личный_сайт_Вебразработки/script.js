const themeButtons = document.querySelectorAll('.theme-btn');
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function getSavedTheme() {
  return localStorage.getItem('tf-theme') || 'auto';
}

function applyTheme(mode) {
  const effectiveTheme = mode === 'auto'
    ? (mediaQuery.matches ? 'dark' : 'light')
    : mode;

  document.documentElement.setAttribute('data-theme', effectiveTheme);

  themeButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === mode);
  });
}

themeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.theme;
    localStorage.setItem('tf-theme', mode);
    applyTheme(mode);
  });
});

mediaQuery.addEventListener('change', () => {
  if (getSavedTheme() === 'auto') {
    applyTheme('auto');
  }
});

applyTheme(getSavedTheme());

const scrollBtn = document.getElementById('scrollBtn');
const cardsSection = document.getElementById('cardsSection');

scrollBtn.addEventListener('click', () => {
  cardsSection.scrollIntoView({ behavior: 'smooth' });
});

const blobs = document.querySelectorAll('.blob');
let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function animateBlobs() {
  currentX += (mouseX - currentX) * 0.05;
  currentY += (mouseY - currentY) * 0.05;

  blobs.forEach((blob, i) => {
    const depth = (i + 1) * 20;
    blob.style.transform = `translate(${currentX * depth}px, ${currentY * depth}px)`;
  });

  requestAnimationFrame(animateBlobs);
}

animateBlobs();

const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');

let cols, rows;
const pixelSize = 18;
const gap = 4;
const colors = ['#FF3B3B', '#FFD60A', '#2E8BFF'];

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  cols = Math.floor(rect.width / (pixelSize + gap));
  rows = Math.floor(rect.height / (pixelSize + gap));
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let time = 0;
const mouseLocal = { x: 0.5, y: 0.5 };

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseLocal.x = (e.clientX - rect.left) / rect.width;
  mouseLocal.y = (e.clientY - rect.top) / rect.height;
});

function drawPixels() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * (pixelSize + gap);
      const y = r * (pixelSize + gap);

      const nx = c / cols;
      const ny = r / rows;
      const wave = Math.sin(nx * 6 + time) * Math.cos(ny * 6 + time * 0.8);

      const dx = nx - mouseLocal.x;
      const dy = ny - mouseLocal.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mouseInfluence = Math.max(0, 1 - dist * 3);

      const value = (wave + 1) / 2 + mouseInfluence * 0.8;

      if (value > 0.45) {
        const colorIndex = Math.floor((value * 10 + c + r) % colors.length);
        ctx.fillStyle = colors[colorIndex];
        ctx.globalAlpha = Math.min(1, value);
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }
  }

  ctx.globalAlpha = 1;
  time += 0.02;
  requestAnimationFrame(drawPixels);
}

drawPixels();

const cards = document.querySelectorAll('.card');

const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

cards.forEach((card) => cardObserver.observe(card));

const cardCanvases = document.querySelectorAll('.card-canvas');

cardCanvases.forEach((canvasEl) => {
  const c = canvasEl.getContext('2d');
  const color = canvasEl.dataset.color || '#000';
  const pSize = 14;
  const pGap = 3;

  let cCols, cRows, w, h;

  function resize() {
    const rect = canvasEl.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvasEl.width = rect.width * dpr;
    canvasEl.height = rect.height * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    w = rect.width;
    h = rect.height;
    cCols = Math.floor(w / (pSize + pGap));
    cRows = Math.floor(h / (pSize + pGap));
  }

  resize();
  window.addEventListener('resize', resize);

  let t = Math.random() * 10;

  function draw() {
    c.clearRect(0, 0, w, h);

    for (let r = 0; r < cRows; r++) {
      for (let col = 0; col < cCols; col++) {
        const x = col * (pSize + pGap);
        const y = r * (pSize + pGap);

        const nx = col / cCols;
        const ny = r / cRows;
        const wave = Math.sin(nx * 5 + t) * Math.cos(ny * 5 + t * 0.7);
        const value = (wave + 1) / 2;

        if (value > 0.55) {
          c.fillStyle = color;
          c.globalAlpha = value;
          c.fillRect(x, y, pSize, pSize);
        }
      }
    }

    c.globalAlpha = 1;
    t += 0.02;
    requestAnimationFrame(draw);
  }

  draw();
});

const projects = document.querySelectorAll('.project');

const projectObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

projects.forEach((p) => projectObserver.observe(p));

const githubCanvas = document.getElementById('githubCanvas');

if (githubCanvas) {
  const c = githubCanvas.getContext('2d');
  const githubColors = ['#FF3B3B', '#FFD60A', '#2E8BFF'];
  const pSize = 22;
  const pGap = 6;

  let gCols, gRows, w, h;

  function resize() {
    const rect = githubCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    githubCanvas.width = rect.width * dpr;
    githubCanvas.height = rect.height * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    w = rect.width;
    h = rect.height;
    gCols = Math.floor(w / (pSize + pGap));
    gRows = Math.floor(h / (pSize + pGap));
  }

  resize();
  window.addEventListener('resize', resize);

  let t = 0;

  function draw() {
    c.clearRect(0, 0, w, h);

    for (let r = 0; r < gRows; r++) {
      for (let col = 0; col < gCols; col++) {
        const x = col * (pSize + pGap);
        const y = r * (pSize + pGap);

        const nx = col / gCols;
        const ny = r / gRows;
        const wave = Math.sin(nx * 5 + t) * Math.cos(ny * 5 + t * 0.7);
        const value = (wave + 1) / 2;

        if (value > 0.6) {
          const colorIndex = Math.floor((col + r + t) % githubColors.length);
          c.fillStyle = githubColors[colorIndex];
          c.globalAlpha = value * 0.8;
          c.fillRect(x, y, pSize, pSize);
        }
      }
    }

    c.globalAlpha = 1;
    t += 0.02;
    requestAnimationFrame(draw);
  }

  draw();
}