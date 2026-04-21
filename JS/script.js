// Global variables
let products = [];
let mitra = [];
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadMitra();
    setupEventListeners();
    applyDarkMode();
    updateCartCount();
    displayFavorites();
    displayCart();
});

// Load products from JSON
async function loadProducts() {
    try {
        updateDebugInfo('Loading products from JSON...');
        const response = await fetch('DATA/Tabel Produk_rows.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        products = await response.json();

        updateDebugInfo(`Loaded ${products.length} products from JSON`);
        console.log('Raw products data:', products.slice(0, 2)); // Log first 2 products

        // Convert Google Drive URLs to viewable format
        products = products.map(product => ({
            ...product,
            produk_image: convertGoogleDriveUrl(product.produk_image)
        }));

        updateDebugInfo('Google Drive URLs converted');
        console.log('Products after URL conversion:', products.slice(0, 2)); // Log first 2 converted products

        displayProducts(products);
        displayProdukGrid(products);
        updateDebugInfo('Products displayed successfully');
    } catch (error) {
        console.error('Error loading products:', error);
        updateDebugInfo(`Error loading products: ${error.message}`);
        // Show error message to user
        const productList = document.getElementById('product-list');
        if (productList) {
            productList.innerHTML = '<div class="error-message">Gagal memuat produk. Silakan refresh halaman.</div>';
        }
        const produkGrid = document.getElementById('produk-grid');
        if (produkGrid) {
            produkGrid.innerHTML = '<div class="error-message">Gagal memuat produk. Silakan refresh halaman.</div>';
        }
    }
}

// Convert Google Drive URL to viewable format
function convertGoogleDriveUrl(url) {
    if (!url) {
        updateDebugInfo('Empty URL provided, using placeholder');
        return 'https://via.placeholder.com/300x300?text=No+Image';
    }

    updateDebugInfo(`Converting URL: ${url.substring(0, 50)}...`);

    // Handle different Google Drive URL formats
    if (url.includes('lh3.googleusercontent.com/d/')) {
        // Format: https://lh3.googleusercontent.com/d/{fileId}
        const fileId = url.split('/d/')[1].split('?')[0]; // Remove query parameters
        const newUrl = `https://drive.google.com/uc?id=${fileId}`;
        updateDebugInfo(`Converted to: ${newUrl}`);
        return newUrl;
    } else if (url.includes('drive.google.com/file/d/')) {
        // Format: https://drive.google.com/file/d/{fileId}/view
        const fileId = url.split('/file/d/')[1].split('/')[0];
        const newUrl = `https://drive.google.com/uc?id=${fileId}`;
        updateDebugInfo(`Converted to: ${newUrl}`);
        return newUrl;
    } else if (url.includes('drive.google.com/open?id=')) {
        // Format: https://drive.google.com/open?id={fileId}
        const fileId = url.split('id=')[1].split('&')[0];
        const newUrl = `https://drive.google.com/uc?id=${fileId}`;
        updateDebugInfo(`Converted to: ${newUrl}`);
        return newUrl;
    }

    updateDebugInfo('URL not converted, returning original');
    return url;
}

// Test image loading function (can be called from browser console)
function testImageLoading(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            console.log('Image loaded successfully:', url);
            resolve(true);
        };
        img.onerror = () => {
            console.error('Image failed to load:', url);
            reject(false);
        };
        img.src = url;
    });
}

// Test all product images
function testAllProductImages() {
    console.log('Testing all product images...');
    products.forEach((product, index) => {
        testImageLoading(product.produk_image)
            .then(() => console.log(`✅ Product ${index + 1} (${product.produk_name}): OK`))
            .catch(() => console.log(`❌ Product ${index + 1} (${product.produk_name}): FAILED`));
    });
}

// Make functions available globally for console testing
window.testImageLoading = testImageLoading;
window.testAllProductImages = testAllProductImages;

// Debug panel functions
function toggleDebugPanel() {
    const panel = document.getElementById('debug-panel');
    panel.classList.toggle('hidden');
}

function updateDebugInfo(message) {
    const debugContent = document.getElementById('debug-content');
    if (debugContent) {
        const timestamp = new Date().toLocaleTimeString();
        debugContent.innerHTML += `<div>[${timestamp}] ${message}</div>`;
        debugContent.scrollTop = debugContent.scrollHeight;
    }
}

// Make debug functions globally available
window.toggleDebugPanel = toggleDebugPanel;
window.updateDebugInfo = updateDebugInfo;

// Handle image loading errors
function handleImageError(img) {
    updateDebugInfo(`Image failed to load: ${img.src.substring(0, 50)}...`);
    console.warn('Image failed to load:', img.src);
    console.warn('Image alt:', img.alt);

    // Try alternative URL format if current one failed
    const originalSrc = img.src;
    if (originalSrc.includes('drive.google.com/uc?id=')) {
        // Try with export=view parameter
        const fileId = originalSrc.split('id=')[1];
        img.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
        updateDebugInfo(`Trying alternative format: ${img.src}`);
        return;
    }

    // If all Google Drive formats failed, use placeholder
    img.src = 'https://via.placeholder.com/300x300?text=Gambar+Tidak+Tersedia';
    updateDebugInfo(`Using placeholder for failed image: ${originalSrc}`);
    return;
    img.onerror = null; // Prevent infinite loop
    updateDebugInfo('Using placeholder for failed image');
}

// Load mitra from JSON
async function loadMitra() {
    try {
        const response = await fetch('DATA/Tabel Mitra_rows.json');
        mitra = await response.json();
        displayMitra(mitra);
    } catch (error) {
        console.error('Error loading mitra:', error);
    }
}

// Display products in home page
function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    products.slice(0, 5).forEach(product => {
        const isFavorite = favorites.includes(product.produk_id);
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.onclick = () => showProductDetail(product);

        productItem.innerHTML = `
            <img src="${product.produk_image}" alt="${product.produk_name}" class="product-image" onerror="handleImageError(this)">
            <div class="product-info">
                <h3>${product.produk_name}</h3>
                <p>${product.produk_price}</p>
                <p>Stock: ${product.produk_stock}</p>
                <div class="product-actions">
                    <button class="favorite-btn ripple ${isFavorite ? 'favorited' : ''}" onclick="toggleFavorite(event, '${product.produk_id}')">${isFavorite ? '❤️' : '🤍'}</button>
                    <button class="add-to-cart-btn ripple" onclick="addToCart(event, '${product.produk_id}')">🛒</button>
                </div>
            </div>
        `;

        productList.appendChild(productItem);
    });
}

// Display products in produk page grid
function displayProdukGrid(products) {
    const produkGrid = document.getElementById('produk-grid');
    produkGrid.innerHTML = '';

    products.forEach(product => {
        const isFavorite = favorites.includes(product.produk_id);
        const produkItem = document.createElement('div');
        produkItem.className = 'produk-item';
        produkItem.onclick = () => showProductDetail(product);

        produkItem.innerHTML = `
            <img src="${product.produk_image}" alt="${product.produk_name}" class="produk-image" onerror="handleImageError(this)">
            <div class="produk-info">
                <h3>${product.produk_name}</h3>
                <p>${product.produk_price}</p>
                <div class="product-actions">
                    <button class="favorite-btn ripple ${isFavorite ? 'favorited' : ''}" onclick="toggleFavorite(event, '${product.produk_id}')">${isFavorite ? '❤️' : '🤍'}</button>
                    <button class="add-to-cart-btn ripple" onclick="addToCart(event, '${product.produk_id}')">🛒</button>
                </div>
            </div>
        `;

        produkGrid.appendChild(produkItem);
    });
}

// Display mitra
function displayMitra(mitra) {
    const mitraList = document.getElementById('mitra-list');
    mitraList.innerHTML = '';

    mitra.forEach(m => {
        const mitraItem = document.createElement('div');
        mitraItem.className = 'mitra-item';
        mitraItem.onclick = () => showMitraDetail(m);

        mitraItem.innerHTML = `
            <h3>${m.mitra_name}</h3>
            <p>Kategori: ${m.kategori}</p>
            <p>Sekolah: ${m.sekolah}</p>
        `;

        mitraList.appendChild(mitraItem);
    });
}

// Display favorites
function displayFavorites() {
    const favoritList = document.getElementById('favorit-list');
    favoritList.innerHTML = '';

    const favoriteProducts = products.filter(p => favorites.includes(p.produk_id));
    favoriteProducts.forEach(product => {
        const favoritItem = document.createElement('div');
        favoritItem.className = 'favorit-item';
        favoritItem.onclick = () => showProductDetail(product);

        favoritItem.innerHTML = `
            <img src="${product.produk_image}" alt="${product.produk_name}" class="product-image" onerror="handleImageError(this)">
            <div class="produk-info">
                <h3>${product.produk_name}</h3>
                <p>${product.produk_price}</p>
                <button class="remove-favorite-btn ripple" onclick="toggleFavorite(event, '${product.produk_id}')">❌ Hapus</button>
            </div>
        `;

        favoritList.appendChild(favoritItem);
    });
}

// Display cart
function displayCart() {
    const keranjangList = document.getElementById('keranjang-list');
    keranjangList.innerHTML = '';

    cart.forEach((item, index) => {
        const product = products.find(p => p.produk_id === item.id);
        if (product) {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';

            cartItem.innerHTML = `
                <img src="${product.produk_image}" alt="${product.produk_name}" class="product-image" onerror="handleImageError(this)">
                <div class="cart-info">
                    <h3>${product.produk_name}</h3>
                    <p>${product.produk_price}</p>
                    <p>Jumlah: ${item.quantity}</p>
                    <button class="remove-cart-btn ripple" onclick="removeFromCart(${index})">❌ Hapus</button>
                </div>
            `;

            keranjangList.appendChild(cartItem);
        }
    });
}

// Show product detail modal
function showProductDetail(product) {
    const detailImage = document.getElementById('detail-image');
    detailImage.src = product.produk_image;
    detailImage.onerror = function() { handleImageError(this); };

    document.getElementById('detail-name').textContent = product.produk_name;
    document.getElementById('detail-price').textContent = `Harga: ${product.produk_price}`;
    document.getElementById('detail-stock').textContent = `Stock: ${product.produk_stock}`;
    document.getElementById('detail-category').textContent = `Kategori: ${product.produk_category}`;

    document.getElementById('product-detail').classList.remove('hidden');
}

// Show mitra detail modal
function showMitraDetail(m) {
    document.getElementById('mitra-detail-name').textContent = m.mitra_name;
    document.getElementById('mitra-owner').textContent = m.owner_name;
    document.getElementById('mitra-email').textContent = m.email_owner;
    document.getElementById('mitra-address').textContent = m.address_owner;
    document.getElementById('mitra-kategori').textContent = m.kategori;
    document.getElementById('mitra-sekolah').textContent = m.sekolah;

    document.getElementById('mitra-detail').classList.remove('hidden');
}

// Toggle favorite
function toggleFavorite(event, productId) {
    event.stopPropagation();
    const index = favorites.indexOf(productId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(productId);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayProducts(products);
    displayProdukGrid(products);
    displayFavorites();
}

// Add to cart
function addToCart(event, productId) {
    event.stopPropagation();
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    applyDarkMode();
}

// Apply dark mode
function applyDarkMode() {
    document.body.classList.toggle('dark-mode', isDarkMode);
    const btn = document.getElementById('dark-mode-btn');
    btn.textContent = isDarkMode ? '☀️' : '🌙';
}

// Setup event listeners
function setupEventListeners() {
    // Bottom navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            switchPage(page);
        });
    });

    // Dark mode toggle
    document.getElementById('dark-mode-btn').addEventListener('click', toggleDarkMode);

    // Search functionality
    document.getElementById('search-btn').addEventListener('click', function() {
        const query = document.getElementById('search-input').value.toLowerCase();
        const filteredProducts = products.filter(p =>
            p.produk_name.toLowerCase().includes(query)
        );
        displayProducts(filteredProducts);
        displayProdukGrid(filteredProducts);
    });

    // Category filter
    document.getElementById('category-filter').addEventListener('change', function() {
        const category = this.value;
        const filteredProducts = category ?
            products.filter(p => p.produk_category === category) :
            products;
        displayProdukGrid(filteredProducts);
    });

    // Auth forms
    document.getElementById('show-register').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    });

    document.getElementById('show-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    });

    document.getElementById('login-btn').addEventListener('click', function() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Simple mock login
        if (email && password) {
            currentUser = { name: 'User', email: email };
            updateAuthUI();
        }
    });

    document.getElementById('register-btn').addEventListener('click', function() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        // Simple mock register
        if (name && email && password) {
            currentUser = { name: name, email: email };
            updateAuthUI();
        }
    });

    document.getElementById('logout-btn').addEventListener('click', function() {
        currentUser = null;
        updateAuthUI();
    });

    // Modal close
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').classList.add('hidden');
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.add('hidden');
            }
        });
    });

    // Add to cart from detail
    const addToCartDetailBtn = document.getElementById('add-to-cart-detail');
    if (addToCartDetailBtn) {
        addToCartDetailBtn.addEventListener('click', function(event) {
            const productName = document.getElementById('detail-name').textContent;
            const product = products.find(p => p.produk_name === productName);
            if (product) {
                addToCart(event, product.produk_id);
            }
        });
    }

    // Favorite from detail
    const favoriteDetailBtn = document.getElementById('favorite-detail');
    if (favoriteDetailBtn) {
        favoriteDetailBtn.addEventListener('click', function(event) {
            const productName = document.getElementById('detail-name').textContent;
            const product = products.find(p => p.produk_name === productName);
            if (product) {
                toggleFavorite(event, product.produk_id);
            }
        });
    }

    // Checkout
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            alert('Checkout berhasil! Total item: ' + cart.reduce((total, item) => total + item.quantity, 0));
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            displayCart();
        });
    }
}

// Switch page function
function switchPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    document.getElementById(pageId).classList.add('active');

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
}

// Update authentication UI
function updateAuthUI() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const profile = document.getElementById('profile');

    if (currentUser) {
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        profile.classList.remove('hidden');

        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-email').textContent = currentUser.email;
    } else {
        profile.classList.add('hidden');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    }
}