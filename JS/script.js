// Global variables
let products = [];
let mitra = [];
let currentUser = null;

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadMitra();
    setupEventListeners();
});

// Load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('DATA/Tabel Produk_rows.json');
        products = await response.json();
        displayProducts(products);
        displayProdukGrid(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
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
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.onclick = () => showProductDetail(product);

        productItem.innerHTML = `
            <img src="${product.produk_image}" alt="${product.produk_name}" class="product-image">
            <div class="product-info">
                <h3>${product.produk_name}</h3>
                <p>${product.produk_price}</p>
                <p>Stock: ${product.produk_stock}</p>
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
        const produkItem = document.createElement('div');
        produkItem.className = 'produk-item';
        produkItem.onclick = () => showProductDetail(product);

        produkItem.innerHTML = `
            <img src="${product.produk_image}" alt="${product.produk_name}" class="produk-image">
            <div class="produk-info">
                <h3>${product.produk_name}</h3>
                <p>${product.produk_price}</p>
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

// Show product detail modal
function showProductDetail(product) {
    document.getElementById('detail-image').src = product.produk_image;
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

    // Search functionality
    document.getElementById('search-btn').addEventListener('click', function() {
        const query = document.getElementById('search-input').value.toLowerCase();
        const filteredProducts = products.filter(p =>
            p.produk_name.toLowerCase().includes(query)
        );
        displayProducts(filteredProducts);
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