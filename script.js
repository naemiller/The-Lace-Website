// ================= FIREBASE MODULE CONFIGURATION & AUTH INTEGRATION =================
// Import modern, modular Firebase SDK from CDN
import { initializeApp } from "https://gstatic.com";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://gstatic.com";

// ⚠️ Replace these with your exact project configuration keys from your Firebase Dashboard console
const firebaseConfig = {
 apiKey: "AIzaSyCkzgI6bFXO8ukneBoImXSJyMNxRNIEhDI",
  authDomain: "thelacewigs-f46a5.firebaseapp.com",
  databaseURL: "https://thelacewigs-f46a5-default-rtdb.firebaseio.com",
  projectId: "thelacewigs-f46a5",
  storageBucket: "thelacewigs-f46a5.firebasestorage.app",
  messagingSenderId: "1004049108512",
  appId: "1:1004049108512:web:4ec7cdf3e2cf683f183645",
  measurementId: "G-DXKGF27ZQW"
};

// Initialize active application instance and Auth sub-system
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Global operational state tracker for current active user session
let currentUserSession = null;

// ================= ORIGINAL SYSTEM CORE STATE & DATA HUB =================
const fallbackCatalogBaseline = [ 
  { id: 1, title: "Ultra HD Raw Straight Lace Wig", price: 580.00, texture: "straight", img: "https://unsplash.com" }, 
  { id: 2, title: "Luxury Body Wave HD Swiss Lace", price: 490.00, texture: "bodywave", img: "https://unsplash.com" }, 
  { id: 3, title: "Exotic Deep Curly HD Frontal Wig", price: 520.00, texture: "curly", img: "https://unsplash.com" }, 
  { id: 4, title: "Classic Silky Straight Closure Wig", price: 320.00, texture: "straight", img: "https://unsplash.com" } 
];

let productsData = JSON.parse(localStorage.getItem('luxury_wigs_inventory')); 
if (!productsData || productsData.length === 0) { 
  productsData = fallbackCatalogBaseline; 
  localStorage.setItem('luxury_wigs_inventory', JSON.stringify(productsData)); 
} 

let cart = []; 
let currentCategory = 'all'; 
let currentSlideIndex = 0; 
const fallbackImg = 'https://unsplash.com'; 

// Combined Application Lifecycle Initializer Hook
document.addEventListener('DOMContentLoaded', () => { 
  renderCarousel(); 
  renderProducts(); 
  setupCartEvents(); 
  setupFilterEvents(); 
  startAutoCarousel();
  setupAuthFormEvents(); // Attaches submit button bindings for credential processing
  
  // Keep local interface rendering logic synchronized with active Firebase token states
  onAuthStateChanged(auth, (user) => {
    currentUserSession = user;
    toggleAdminControlUI(user);
  });
}); 

// ================= NEW: AUTHENTICATION USER INTERFACE HANDLERS =================
function setupAuthFormEvents() {
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevents default browser reload behaviors
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const errorDisplay = document.getElementById('login-error-msg');
      
      if(errorDisplay) errorDisplay.textContent = ''; // Reset UI alert messaging states

      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Authorization Successful!");
        loginForm.reset();
      } catch (error) {
        console.error("Firebase Auth Failure Execution Trace:", error.code);
        if(errorDisplay) {
          errorDisplay.textContent = error.code === 'auth/invalid-credential' 
            ? "Invalid email address or mismatching password layout." 
            : `Authentication error processing request: ${error.message}`;
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        alert("Session terminated successfully.");
      } catch (error) {
        console.error("Sign-out routing exceptions encountered:", error);
      }
    });
  }
}

// Controls whether management components should render depending on account privilege layout
function toggleAdminControlUI(user) {
  const adminPanel = document.getElementById('inventory-management-panel');
  const authPortalWrapper = document.getElementById('auth-portal-interface');

  if (user) {
    // User is logged in
    if(adminPanel) adminPanel.style.display = 'block';
    if(authPortalWrapper) authPortalWrapper.classList.add('user-logged-in');
  } else {
    // User is signed out
    if(adminPanel) adminPanel.style.display = 'none';
    if(authPortalWrapper) authPortalWrapper.classList.remove('user-logged-in');
  }
}

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
  const nextBtn = document.getElementById('carousel-next');
  const prevBtn = document.getElementById('carousel-prev');
  const sortSelect = document.getElementById('sort-select');

  if(nextBtn) {
    nextBtn.addEventListener('click', () => { 
      const maxSlides = Math.max(0, productsData.slice(0, 4).length - getVisibleItemsCount()); 
      currentSlideIndex = (currentSlideIndex >= maxSlides) ? 0 : currentSlideIndex + 1; 
      updateCarouselPosition(); 
    }); 
  }

  if(prevBtn) {
    prevBtn.addEventListener('click', () => { 
      const maxSlides = Math.max(0, productsData.slice(0, 4).length - getVisibleItemsCount()); 
      currentSlideIndex = (currentSlideIndex <= 0) ? maxSlides : currentSlideIndex - 1; 
      updateCarouselPosition(); 
    }); 
  }

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

  if(sortSelect) {
    sortSelect.addEventListener('change', renderProducts); 
  }
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
  
  productsData = JSON.parse(localStorage.getItem('luxury_wigs_inventory')) || fallbackCatalogBaseline; 
  let filtered = productsData.filter(p => currentCategory === 'all' || p.texture === currentCategory); 
  
  const sortSelect = document.getElementById('sort-select');
  const sortValue = sortSelect ? sortSelect.value : 'featured'; 
  
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
        <button class="add-to-cart-btn" data-id="${product.id}">Add To Bag</button>
      </div>
    `; 
    productsContainer.appendChild(card);
  }); 
  
  // Re-attach listeners to dynamic storefront button elements securely
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      addToBag(id);
    });
  });
}

