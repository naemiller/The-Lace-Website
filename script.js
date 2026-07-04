// Sample baseline luxury inventory data structure
let productsData = [
    { id: 1, title: "Ultra HD Raw Straight Lace Wig", price: 350.00, texture: "straight", img: "images/straight-wig.jpg" },
    { id: 2, title: "Luxury Body Wave HD Swiss Lace", price: 380.00, texture: "bodywave", img: "images/bodywave-wig.jpg" },
    { id: 3, title: "Exotic Deep Curly HD Frontal Wig", price: 410.00, texture: "curly", img: "images/curly-wig.jpg" },
    { id: 4, title: "Classic Silky Straight Closure Wig", price: 290.00, texture: "straight", img: "images/straight-closure.jpg" },
    { id: 5, title: "Premium Melted Body Wave Closure", price: 320.00, texture: "bodywave", img: "images/bodywave-closure.jpg" }
];

let cart = [];
let currentCategory = 'all';
let currentSlideIndex = 0;

// Dynamic fallbacks if tracking source images are completely missing
const fallbackImg = 'https://placeholder.com';

// Initial Application Activation Booting Sequence
document.addEventListener('DOMContentLoaded', () => {
    renderCarousel();
    renderProducts();
    setupCartEvents();
    setupFilterEvents();
    setupAdminForm();
    startAutoCarousel();
});

/* ================= FEATURED HAIR SLIDER / CAROUSEL DYNAMICS ================= */
function renderCarousel() {
    const track = document.getElementById('carousel-track');
    const dotsContainer = document.getElementById('carousel-dots');
    track.innerHTML = '';
    dotsContainer.innerHTML = '';

    // Feature top 4 item objects in slider
    const featuredItems = productsData.slice(0, 4);

    featuredItems.forEach((product, index) => {
        // Build Track Card
        const item = document.createElement('div');
        item.className = 'carousel-item';
        item.innerHTML = `
            <img src="${product.img}" alt="${product.title}" onerror="this.src='${fallbackImg}'">
            <h4>${product.title}</h4>
            <p>$${product.price.toFixed(2)}</p>
        `;
        track.appendChild(item);

        // Build Dot Nav Anchor Links
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
    
    if(items.length === 0) return;
    
    // Calculate width translation step bounds dynamically
    const itemWidth = items[0].getBoundingClientRect().width + 20; // width + gap
    track.style.transform = `translateX(-${currentSlideIndex * itemWidth}px)`;

    // Update operational dots
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
    // Nav Navigation buttons control actions
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

    // Resize event tracking layout parameters
    window.addEventListener('resize', updateCarouselPosition);

    // Filter Buttons logic
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
    }, 5000); // Transitions seamlessly automatically every 5 seconds
}


/* ================= LIVE SALE MANAGER SYSTEM ================= */
function setupAdminForm() {
    const form = document.getElementById('add-product-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop standard form page refreshes
        
        // Harvest system configuration field values
        const title = document.getElementById('new-title').value;
        const price = parseFloat(document.getElementById('new-price').value);
        const texture = document.getElementById('new-texture').value;
        let imgUrl = document.getElementById('new-image').value.trim();

        if (!imgUrl) {
            imgUrl = fallbackImg;
        }

        // Generate brand new unique object data map
        const newProduct = {
            id: Date.now(), // Generate a secure item timestamp reference ID
            title: title,
            price: price,
            texture: texture,
            img: imgUrl
        };

        // Push layout elements directly to local state
        productsData.unshift(newProduct); 

        // Rerender layout blocks safely
        renderProducts();
        renderCarousel();
        
        // Reset entry dashboard interfaces cleanly
        form.reset();
        alert(`Successfully Listed "${title}" For Sale!`);
    });
}


/* ================= DYNAMIC GRID & CART FUNCTIONS ================= */
function renderProducts() {
    const productsContainer = document.getElementById('products-container');
    let filtered = productsData.filter(p => currentCategory === 'all' || p.texture === currentCategory);
    
    const sortValue = document.getElementById('sort-select').value;
    if (sortValue === 'low-high') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'high-low') {
        filtered.sort((a, b) => b.price - a.price);
    }

    productsContainer.innerHTML = '';
    
    if(filtered.length === 0) {
        productsContainer.innerHTML = `<p style="padding: 20px;">No custom premium wigs match your active search filters.</p>`;
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
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="addToBag(${product.id})">Add To Bag</button>
            </div>
        `;
        productsContainer.appendChild(card);
    });
}

function addToBag(id) {
    const product = productsData.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) { existingItem.quantity += 1; } 
    else { cart.push({ ...product, quantity: 1 }); }
    updateCartUI();
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
}

function removeFromBag(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';
    let total = 0, count = 0;

    if (cart.length === 0) {
        container.innerHTML = `<p class="empty-message">Your bag is currently empty.</p>`;
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;
            const itemRow = document.createElement('div');
            itemRow.className = 'cart-item';
            itemRow.innerHTML = `
                <img src="${item.img}" class="cart-item-img" onerror="this.src='${fallbackImg}'">
                <div class="cart-item-details">
                    <div class="product-title" style="font-size:14px; margin-bottom:4px;">${item.title}</div>
                    <div style="font-size:13px; color:#666;">Qty: ${item.quantity} &times; $${item.price.toFixed(2)}</div>
                    <button class="cart-item-remove" onclick="removeFromBag(${item.id})">Remove</button>
                </div>
            `;
            container.appendChild(itemRow);
        });
    }
    document.getElementById('cart-subtotal').textContent = `$${total.toFixed(2)}`;
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
}

function setupCartEvents() {
    document.getElementById('cart-toggle-btn').addEventListener('click', () => {
        document.getElementById('cart-drawer').classList.add('open');
        document.getElementById('cart-overlay').classList.add('open');
    });
    document.getElementById('cart-close-btn').addEventListener('click', closeCart);
