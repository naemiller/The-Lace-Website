/* --- PRODUCT DATA (Ideally fetched from an API in 2026) --- */
let products = [];
let cart = JSON.parse(localStorage.getItem('theLaceWigsCart')) || []; // Persistent Cart

/* --- 1. INITIALIZATION & DATA FETCHING --- */
async function initStore() {
    showLoading(true);
    try {
        // In a real project, fetch from your Supabase/Firebase API
        // For now, we simulate a network delay for the "Loading Spinner" effect
        await new Promise(resolve => setTimeout(resolve, 800)); 
        
        products = [
            { id: 1, name: "HD Frontal - Body Wave", price: 350.00, type: "Wave", rating: "★★★★★" },
            { id: 2, name: "Full Lace - Straight Silky", price: 420.00, category: "Straight", rating: "★★★★★" },
            { id: 3, name: "Glueless Wear & Go - Curly", price: 280.00, category: "Curly", rating: "★★★★☆" },
            { id: 4, name: "Bob Cut - 13x4 Straight", price: 195.00, category: "Straight", rating: "★★★★★" }
        ];
        
        renderProducts(products);
        updateCartUI();
    } catch (error) {
        console.error("Store Init Failed:", error);
    } finally {
        showLoading(false);
    }
}

/* --- 2. FILTERING & SORTING LOGIC --- */
function handleFilterChange() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const sort = document.getElementById('sortOrder').value;

    let filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search);
        const matchesCategory = category === 'all' || p.type === category;
        return matchesSearch && matchesCategory;
    });

    if (sort === "low") filtered.sort((a, b) => a.price - b.price);
    if (sort === "high") filtered.sort((a, b) => b.price - a.price);

    renderProducts(filtered);
}

/* --- 3. UI RENDERING --- */
function renderProducts(data) {
    const grid = document.getElementById('product-grid');
    if (data.length === 0) {
        grid.innerHTML = `<div class="empty-state">No matching wigs found.</div>`;
        return;
    }

    grid.innerHTML = data.map(p => `
        <div class="product-card">
            <div class="img-container"><div class="product-img">HD LACE</div></div>
            <div class="product-info">
                <div class="rating">${p.rating}</div>
                <h3>${p.name}</h3>
                <p class="price">${formatCurrency(p.price)}</p>
                <button class="btn btn-primary" onclick="addToCart(${p.id})">Add to Bag</button>
            </div>
        </div>
    `).join('');
}

/* --- 4. CART & PERSISTENCE --- */
function addToCart(id) {
    const item = products.find(p => p.id === id);
    cart.push(item);
    localStorage.setItem('theLaceWigsCart', JSON.stringify(cart)); // Save to LocalStorage
    updateCartUI();
    toggleCart(true);
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-total').innerText = total.toFixed(2);
    
    // Optional: Render items inside the cart modal here
}

/* --- 5. PROFESSIONAL UTILITIES --- */
function formatCurrency(num) {
    // Uses Native Intl API - highly recommended for job-seekers
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

function showLoading(isLoading) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = isLoading ? `<div class="spinner">Loading Luxury Hair...</div>` : '';
}

// Start the store
initStore();
