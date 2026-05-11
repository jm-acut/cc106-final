// Configuration
const API_URL = 'http://localhost:5000/api'; // Change to deployed URL in production
const SESSION_TOKEN_KEY = 'ecobite_token';
const SESSION_USER_ID_KEY = 'ecobite_userId';
const SESSION_EMAIL_KEY = 'ecobite_email';
let productCount = 1;

// Utility Functions
function getSessionToken() {
    return localStorage.getItem(SESSION_TOKEN_KEY);
}

function setSessionToken(token) {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
}

function getUserId() {
    return localStorage.getItem(SESSION_USER_ID_KEY);
}

function setUserId(userId) {
    localStorage.setItem(SESSION_USER_ID_KEY, userId);
}

function getUserEmail() {
    return localStorage.getItem(SESSION_EMAIL_KEY);
}

function setUserEmail(email) {
    localStorage.setItem(SESSION_EMAIL_KEY, email);
}

function clearSession() {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_ID_KEY);
    localStorage.removeItem(SESSION_EMAIL_KEY);
}

function getAuthHeaders() {
    const token = getSessionToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// API Call Helper
async function apiCall(endpoint, method = 'GET', data = null) {
    const url = `${API_URL}${endpoint}`;
    const options = {
        method: method,
        headers: getAuthHeaders()
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }
        return await response.json();
    } catch (error) {
        console.error(`API Error [${method} ${endpoint}]:`, error);
        throw error;
    }
}

// User Functions
async function login() {
    const email = document.getElementById("loginEmail")?.value.trim() || "";
    const password = document.getElementById("loginPassword")?.value || "";
    const message = document.getElementById("message");

    if (!message) {
        alert("Unable to show login message.");
        return;
    }

    if (!email || !password) {
        message.style.color = "red";
        message.innerText = "Please enter both email and password.";
        return;
    }

    try {
        const response = await apiCall('/users/login', 'POST', { email, password });
        
        message.style.color = "green";
        message.innerText = "Login successful! Redirecting...";
        
        // Save session
        setSessionToken(response.token);
        setUserId(response.userId);
        setUserEmail(response.email);
        
        setTimeout(() => {
            window.location.href = "home.html";
        }, 800);
    } catch (error) {
        message.style.color = "red";
        message.innerText = error.message || "Invalid email or password. Please try again.";
    }
}

async function createAccount() {
    const email = document.getElementById("email")?.value.trim() || "";
    const password = document.getElementById("password")?.value || "";
    const confirmPassword = document.getElementById("confirmPassword")?.value || "";
    const message = document.getElementById("message");

    if (!message) {
        alert("Unable to show account creation message.");
        return;
    }

    if (!email || !password || !confirmPassword) {
        message.style.color = "red";
        message.innerText = "Please fill in all fields.";
        return;
    }

    if (password !== confirmPassword) {
        message.style.color = "red";
        message.innerText = "Passwords do not match.";
        return;
    }

    try {
        const response = await apiCall('/users/register', 'POST', { email, password });
        
        message.style.color = "green";
        message.innerText = "Account created successfully! Redirecting to login...";
        
        // Save session
        setSessionToken(response.token);
        setUserId(response.userId);
        setUserEmail(response.email);
        
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    } catch (error) {
        message.style.color = "red";
        message.innerText = error.message || "Failed to create account. Please try again.";
    }
}

function goToCreate() {
    window.location.href = "create.html";
}

function goToLogin() {
    window.location.href = "index.html";
}

function logout() {
    clearSession();
    window.location.href = "index.html";
}

// Cart Functions
async function getCart() {
    const userId = getUserId();
    if (!userId) return [];
    
    try {
        const response = await apiCall(`/carts/${userId}`, 'GET');
        return response.items || [];
    } catch (error) {
        console.error('Failed to fetch cart:', error);
        return [];
    }
}

async function updateCartBadge() {
    const cartLink = document.getElementById("cartLink");
    if (!cartLink) return;
    
    const cart = await getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartLink.textContent = `Cart${totalQty > 0 ? ` (${totalQty})` : ``}`;
}

function updateCount(){
    const countElement = document.getElementById("count");
    if(countElement){
        countElement.innerText = productCount;
    }
}

function increase(){
    productCount += 1;
    updateCount();
}

function decrease(){
    if(productCount > 1){
        productCount -= 1;
        updateCount();
    }
}

async function addToCart() {
    const userId = getUserId();
    if (!userId) {
        alert("Please login first");
        window.location.href = "index.html";
        return;
    }

    const details = document.querySelector(".product-details");
    if (!details) {
        alert("Unable to add this item to cart.");
        return;
    }

    const name = details.dataset.productName || document.querySelector(".product-title")?.innerText || "Product";
    const price = parseFloat(details.dataset.productPrice || document.querySelector(".price")?.innerText.replace(/[^0-9.]/g, "")) || 0;
    const image = details.dataset.productImage || document.querySelector(".product-image")?.src || "";
    const productId = details.dataset.productId || name;

    try {
        await apiCall(`/carts/${userId}/items`, 'POST', {
            productId,
            name,
            price,
            quantity: productCount,
            image
        });

        alert(`Added ${productCount} item(s) to cart`);
        productCount = 1;
        updateCount();
        updateCartBadge();
    } catch (error) {
        alert("Failed to add item to cart: " + error.message);
    }
}

async function displayCartItems() {
    const cartItems = document.getElementById("cartItems");
    const totalPrice = document.getElementById("cartTotal");
    if (!cartItems || !totalPrice) return;

    const cart = await getCart();
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
        totalPrice.innerText = "0.00";
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const itemElement = document.createElement("div");
        itemElement.className = "cart-item";
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-info">
                <h3>${item.name}</h3>
                <p>Price: ₱${item.price.toFixed(2)}</p>
                <p>Qty: ${item.quantity}</p>
                <p>Subtotal: ₱${subtotal.toFixed(2)}</p>
            </div>
            <button class="remove-btn" onclick="removeFromCart('${item.productId}')">Remove</button>
        `;
        cartItems.appendChild(itemElement);
    });

    totalPrice.innerText = total.toFixed(2);
}

async function removeFromCart(productId) {
    const userId = getUserId();
    if (!userId) return;

    try {
        await apiCall(`/carts/${userId}/items/${productId}`, 'DELETE');
        updateCartBadge();
        displayCartItems();
    } catch (error) {
        alert("Failed to remove item from cart: " + error.message);
    }
}

async function clearCart() {
    const userId = getUserId();
    if (!userId) return;

    try {
        await apiCall(`/carts/${userId}`, 'DELETE');
        updateCartBadge();
        displayCartItems();
    } catch (error) {
        alert("Failed to clear cart: " + error.message);
    }
}

function goToCheckout() {
    const userId = getUserId();
    if (!userId) {
        alert("Please login first");
        window.location.href = "index.html";
        return;
    }
    window.location.href = "checkout.html";
}

async function placeOrder() {
    const userId = getUserId();
    if (!userId) {
        alert("Please login first");
        window.location.href = "index.html";
        return;
    }

    const fullName = document.getElementById("fullName")?.value || "";
    const emailAddress = document.getElementById("emailAddress")?.value || "";
    const phoneNumber = document.getElementById("phoneNumber")?.value || "";
    const deliveryAddress = document.getElementById("deliveryAddress")?.value || "";
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || "cod";

    if (!fullName || !emailAddress || !phoneNumber || !deliveryAddress) {
        alert("Please fill in all required fields");
        return;
    }

    const cart = await getCart();
    if (cart.length === 0) {
        alert("Your cart is empty");
        return;
    }

    try {
        const response = await apiCall('/orders', 'POST', {
            userId,
            name: fullName,
            email: emailAddress,
            phone: phoneNumber,
            address: deliveryAddress,
            paymentMethod,
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        });

        // Store order number in session storage for confirmation page
        sessionStorage.setItem('currentOrderNumber', response.orderNumber);

        // Clear cart
        await clearCart();

        window.location.href = "order-confirmation.html";
    } catch (error) {
        alert("Failed to place order: " + error.message);
    }
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", async function() {
    updateCount();
    await updateCartBadge();
    await displayCartItems();
});