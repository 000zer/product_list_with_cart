/* ===================================
   DOM ELEMENTS SELECTION
   =================================== */
const productList = document.getElementById('product-list');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalAmount = document.querySelector('.total-amount');
const cartEmpty = document.getElementById('cart-empty');
const cartContent = document.getElementById('cart-content');
const cartCount = document.getElementById('cart-count');
const confirmOrderBtn = document.getElementById('confirm-btn');
const confirmOrderContainer = document.getElementById('confirm-order-container');
const confirmOrderModal = document.getElementById('confirm-order-modal');

/* ===================================
   STATE MANAGEMENT
   =================================== */
let cart = [];
let productsData = [];

/* ===================================
   DATA FETCHING
   =================================== */
// Fetch products data from JSON file
const fetchData = async () => {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        productList.innerHTML = '<p style="color: var(--red);">Failed to load products. Please refresh the page.</p>';
        return [];
    }
};

/* ===================================
   PRODUCT RENDERING
   =================================== */
// Render all products to the page
const renderProducts = (data) => {
    // Store products data globally
    productsData = data;
    
    data.forEach(product => {
        // Create product card element
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image-container">   
                <img src="${product.image.desktop}" alt="${product.name}" class="product-image"/>
                
                <!-- Add to Cart Button -->
                <button class="product-btn" data-product-name="${product.name}">
                    <img src="./assets/images/icon-add-to-cart.svg" alt="Add to Cart" class="btn-icon"/>
                    <span>Add to Cart</span>
                </button>
                
                <!-- Quantity Control (hidden initially) -->
                <div class="product-btn-added" data-product-name="${product.name}" style="display: none;">
                    <button class="decrement-btn" aria-label="Decrease quantity"></button>
                    <span class="quantity-display">0</span>
                    <button class="increment-btn" aria-label="Increase quantity"></button>
                </div>
            </div>
            
            <p class="product-category">${product.category}</p>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
        `;
        
        // Get button elements
        const addToCartButton = productCard.querySelector('.product-btn');
        const incrementBtn = productCard.querySelector('.increment-btn');
        const decrementBtn = productCard.querySelector('.decrement-btn');
        
        // Add to cart event
        addToCartButton.addEventListener('click', () => {
            addToCart(product);
        });
        
        // Increment quantity event
        incrementBtn.addEventListener('click', () => {
            addToCart(product);
        });
        
        // Decrement quantity event
        decrementBtn.addEventListener('click', () => {
            removeFromCart(product.name);
        });
        
        // Append card to product list
        productList.appendChild(productCard);
    });
};

/* ===================================
   CART OPERATIONS
   =================================== */
// Add item to cart
const addToCart = (product) => {
    cart.push(product);
    updateCartUI();
    updateProductButton(product.name);
};

// Remove one instance of item from cart
const removeFromCart = (productName) => {
    const index = cart.findIndex(item => item.name === productName);
    if (index !== -1) {
        cart.splice(index, 1);
        updateCartUI();
        updateProductButton(productName);
    }
};

// Remove all instances of item from cart
const removeAllFromCart = (productName) => {
    cart = cart.filter(item => item.name !== productName);
    updateCartUI();
    updateProductButton(productName);
};

/* ===================================
   PRODUCT BUTTON STATE UPDATE
   =================================== */
// Update product button based on cart quantity
const updateProductButton = (productName) => {
    // Find the product card
    const productCard = Array.from(document.querySelectorAll('.product-card')).find(
        card => card.querySelector('.product-name').textContent === productName
    );
    
    if (!productCard) return;
    
    // Get button elements
    const addBtn = productCard.querySelector('.product-btn');
    const addedBtn = productCard.querySelector('.product-btn-added');
    const quantityDisplay = addedBtn.querySelector('.quantity-display');
    const productImage = productCard.querySelector('.product-image');
    
    // Calculate quantity in cart
    const quantity = cart.filter(item => item.name === productName).length;
    
    // Update button display based on quantity
    if (quantity > 0) {
        addBtn.style.display = 'none';
        addedBtn.style.display = 'flex';
        quantityDisplay.textContent = quantity;
        productImage.style.border = '2px solid var(--red)';
    } else {
        addBtn.style.display = 'flex';
        addedBtn.style.display = 'none';
        productImage.style.border = 'none';
    }
};

/* ===================================
   CART UI UPDATE
   =================================== */
// Update cart display and calculations
const updateCartUI = () => {
    // Clear cart items container
    cartItemsContainer.innerHTML = '';
    
    // Update cart count badge
    const totalItems = cart.length;
    cartCount.textContent = totalItems;
    
    // Show empty state if cart is empty
    if (cart.length === 0) {
        cartEmpty.style.display = 'flex';
        cartContent.style.display = 'none';
        return;
    }
    
    // Show cart content
    cartEmpty.style.display = 'none';
    cartContent.style.display = 'flex';
    
    let total = 0;
    
    // Group items by name to avoid duplicates
    const groupedItems = cart.reduce((acc, item) => {
        if (!acc[item.name]) {
            acc[item.name] = {
                ...item,
                quantity: 0
            };
        }
        acc[item.name].quantity++;
        return acc;
    }, {});
    
    // Display each unique item
    Object.values(groupedItems).forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        // Create cart item element
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h3 class="cart-item-name">${item.name}</h3>
                <div class="cart-item-price-container">
                    <span class="cart-item-quantity">${item.quantity}x</span>
                    <span class="cart-item-price">@ $${item.price.toFixed(2)}</span>
                    <span class="cart-item-total-price">$${itemTotal.toFixed(2)}</span>
                </div>
            </div>
            <button class="remove-btn" data-name="${item.name}" aria-label="Remove ${item.name}"></button>
        `;
        
        // Remove button event listener
        const removeButton = cartItem.querySelector('.remove-btn');
        removeButton.addEventListener('click', () => {
            removeAllFromCart(item.name);
        });
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Update total amount display
    cartTotalAmount.textContent = `$${total.toFixed(2)}`;
};

/* ===================================
   ORDER CONFIRMATION MODAL
   =================================== */
// Show confirmation modal with order details
const showConfirmationModal = () => {
    // Check if cart is empty
    if (cart.length === 0) {
        alert('Your cart is empty. Please add some products before confirming your order.');
        return;
    }
    
    let total = 0;
    
    // Group items by name
    const groupedItems = cart.reduce((acc, item) => {
        if (!acc[item.name]) {
            acc[item.name] = {
                ...item,
                quantity: 0
            };
        }
        acc[item.name].quantity++;
        return acc;
    }, {});
    
    // Build items HTML
    let itemsHTML = '';
    Object.values(groupedItems).forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div class="confirm-order-item">
                <div class="confirm-order-item-left">
                    <img src="${item.image.thumbnail}" alt="${item.name}" class="confirm-order-item-image"/>
                    <div class="confirm-order-item-details">
                        <h3>${item.name}</h3>
                        <div class="confirm-order-item-price">
                            <span class="confirm-order-item-quantity">${item.quantity}x</span>
                            <span class="confirm-order-item-unit-price">@ $${item.price.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <span class="confirm-order-item-total">$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    // Create modal content
    confirmOrderContainer.innerHTML = `
        <div class="confirm-order-header">
            <img src="./assets/images/icon-order-confirmed.svg" alt="Order Confirmed"/>
            <h2>Order Confirmed</h2>
            <p>We hope you enjoy your food!</p>
        </div>
        
        <div class="confirm-order-items">
            ${itemsHTML}
            <div class="confirm-order-total">
                <span class="confirm-order-total-label">Order Total</span>
                <span class="confirm-order-total-amount">$${total.toFixed(2)}</span>
            </div>
        </div>
        
        <button class="new-order-btn" id="new-order-btn">Start New Order</button>
    `;
    
    // Show modal
    confirmOrderModal.classList.add('active');
    
    // New order button event
    const newOrderBtn = document.getElementById('new-order-btn');
    newOrderBtn.addEventListener('click', () => {
        closeConfirmationModal();
        resetCart();
    });
};

// Close confirmation modal
const closeConfirmationModal = () => {
    confirmOrderModal.classList.remove('active');
};

// Reset cart and all product buttons
const resetCart = () => {
    cart = [];
    updateCartUI();
    
    // Reset all product buttons to initial state
    productsData.forEach(product => {
        updateProductButton(product.name);
    });
};

/* ===================================
   GLOBAL EVENT LISTENERS
   =================================== */
// Confirm order button
confirmOrderBtn.addEventListener('click', showConfirmationModal);

// Close modal when clicking outside
confirmOrderModal.addEventListener('click', (e) => {
    if (e.target === confirmOrderModal) {
        closeConfirmationModal();
    }
});

/* ===================================
   INITIALIZATION
   =================================== */
// Fetch data and render products on page load
fetchData().then(data => {
    if (data.length > 0) {
        renderProducts(data);
    }
});