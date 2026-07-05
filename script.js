// Baseline luxury product collection database mapping references
const fallbackCatalogBaseline = [
  { id: 1, title: "Ultra HD Raw Straight Lace Wig", price: 580.00, texture: "straight", img: "https://unsplash.com" },
  { id: 2, title: "Luxury Body Wave HD Swiss Lace", price: 490.00, texture: "bodywave", img: "https://unsplash.com" },
  { id: 3, title: "Exotic Deep Curly HD Frontal Wig", price: 520.00, texture: "curly", img: "https://unsplash.com" },
  { id: 4, title: "Classic Silky Straight Closure Wig", price: 320.00, texture: "straight", img: "https://unsplash.com" }
];

// Read from database workspace caches
let productsData = JSON.parse(localStorage.getItem('luxury_wigs_inventory'));
if (!productsData || productsData.length === 0) {
  productsData = fallbackCatalogBaseline;
  localStorage.setItem('luxury_wigs_inventory', JSON.stringify(productsData));
}

let cart = [];
let currentCategory = 'all';
let currentSlideIndex = 0;
const fallbackImg = 'https://unsplash.com';

document.addEventListener('DOMContentLoaded', () => {
  renderCarousel();
  renderProducts();
  setupCartEvents();
  setupFilterEvents();
  startAutoCarousel();
});

/* ================= FEATURED HAIR SLIDER / CAROUSEL DYNAMICS ================= */
function renderCarousel() {
  const track = document.getElementById('carousel-track');
  const dotsContainer = document.getElementById('carousel-dots');
  if(!track || !dotsContainer) return;

  track.innerHTML = '';
  dotsContainer.innerHTML = '';

  const featuredItems = productsData.slice(0, 4);
  featuredItems.forEach((product, index) => {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.innerHTML = `
      <img src="${product.img}" alt="${product.title}" onerror="this.src='${fallbackImg}'">
      <h4>${product.title}</h4>
      <p>£${product.price.toFixed(2)}</p>
    `;
    track.appendChild(item);

    const dot = document.createElement('span');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => jumpToSlide(index));
    dotsContainer.appendChild(dot);
  });
  updateCarouselPosition();
}

function updateCarouselPosition() {
  const track = document.getElementById('carousel-track');
  const items = document.querySelectorAll('.carousel-item');
  const dots = document.querySelectorAll('.dot');
  if(!track || items.length === 0) return;

  const itemWidth = items[0].getBoundingClientRect().width + 20;
  track.style.transform = `translateX(-${currentSlideIndex * itemWidth}px)`;

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSlideIndex);
  });
}

function jumpToSlide(index) {
  const maxSlides = Math.max(0, productsData.slice(0, 4).length - getVisibleItemsCount());
  currentSlideIndex = Math.min(Math.max(0, index), maxSlides);
  updateCarouselPosition();
}

function getVisibleItemsCount() {
  if (window.innerWidth <= 600) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

function setupFilterEvents() {
  document.getElementById('carousel-next').addEventListener('click', () => {
    const maxSlides = Math.max(0, productsData.slice(0, 4).length - getVisibleItemsCount());
    currentSlideIndex = (currentSlideIndex >= maxSlides) ? 0 : currentSlideIndex + 1;
    updateCarouselPosition();
  });

  document.getElementById('carousel-prev').addEventListener('click', () => {
    const maxSlides = Math.max(0, productsData.slice(0, 4).length - getVisibleItemsCount());
    currentSlideIndex = (currentSlideIndex <= 0) ? maxSlides : currentSlideIndex - 1;
    updateCarouselPosition();
  });

  window.addEventListener('resize', updateCarouselPosition);

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.getAttribute('data-category');
      renderProducts();
    });
  });

  document.getElementById('sort-select').addEventListener('change', renderProducts);
}

function startAutoCarousel() {
  setInterval(() => {
    const maxSlides = Math.max(0, productsData.slice(0, 4).length - getVisibleItemsCount());
    if(maxSlides > 0) {
      currentSlideIndex = (currentSlideIndex >= maxSlides) ? 0 : currentSlideIndex + 1;
      updateCarouselPosition();
    }
  }, 5000);
}

/* ================= DYNAMIC GRID & CART FUNCTIONS ================= */
function renderProducts() {
  const productsContainer = document.getElementById('products-container');
  if(!productsContainer) return;

  // Sync state variations before running filtration calculations
  productsData = JSON.parse(localStorage.getItem('luxury_wigs_inventory')) || fallbackCatalogBaseline;

  let filtered = productsData.filter(p => currentCategory === 'all' || p.texture === currentCategory);
  const sortValue = document.getElementById('sort-select').value;
  
  if (sortValue === 'low-high') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortValue === 'high-low') {
    filtered.sort((a, b) => b.price - a.price);
  }

  productsContainer.innerHTML = '';
  if(filtered.length === 0) {
    productsContainer.innerHTML = `<p style="padding: 20px;">No premium custom units found matching selection parameters.</p>`;
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img-wrapper">
        <img src="${product.img}" alt="${product.title}" onerror="this.src='${fallbackImg}'">
      </div>
      <div class="product-info">
        <div class="product-title">${product.title}</div>
        <div class="product-price">£${product.price.toFixed(2)}</div>
        <button class="add-to-cart-btn" onclick="addToBag(${
