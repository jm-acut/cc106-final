let productCount = 1;

function saveUser(email, password) {
    localStorage.setItem(email, password);
}

function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("message");

    const savedPassword = localStorage.getItem(email);

    if (savedPassword === password) {
        message.style.color = "green";
        message.innerText = "Login successful";

        localStorage.setItem("loggedInUser", email);

        setTimeout(() => {
            window.location.href = "home.html";
        }, 1000);
    } else {
        message.style.color = "red";
        message.innerText = "Invalid email or password";
    }
}

function createAccount() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("message");

    if (!email || !password || !confirmPassword) {
        message.style.color = "red";
        message.innerText = "Please fill all fields";
        return;
    }

    if (password !== confirmPassword) {
        message.style.color = "red";
        message.innerText = "Passwords do not match";
        return;
    }

    saveUser(email, password);

    message.style.color = "green";
    message.innerText = "Account created successfully";

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);
}

function goToCreate() {
    window.location.href = "create.html";
}

function goToLogin() {
    window.location.href = "index.html";
}

function increase() {
    productCount++;
    document.getElementById("count").innerText = productCount;
}

function decrease() {
    if (productCount > 1) {
        productCount--;
        document.getElementById("count").innerText = productCount;
    }
}

function addToCart() {
    const details = document.querySelector(".product-details");

    const product = {
        id: details.dataset.productId,
        name: details.dataset.productName,
        price: parseFloat(details.dataset.productPrice),
        image: details.dataset.productImage,
        quantity: productCount
    };

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity += product.quantity;
    } else {
        cart.push(product);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Added to cart");
}

function displayCartItems() {
    const cartItems = document.getElementById("cartItems");
    const totalPrice = document.getElementById("cartTotal");

    if (!cartItems || !totalPrice) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cartItems.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty</p>";
        totalPrice.innerText = "0.00";
        return;
    }

    cart.forEach(item => {
        total += item.price * item.quantity;

        const div = document.createElement("div");

        div.className = "cart-item";

        div.innerHTML = `
            <img src="${item.image}">
            <div class="cart-info">
                <h3>${item.name}</h3>
                <p>₱${item.price}</p>
                <p>Quantity: ${item.quantity}</p>
            </div>

            <button class="remove-btn" onclick="removeFromCart('${item.id}')">
                Remove
            </button>
        `;

        cartItems.appendChild(div);
    });

    totalPrice.innerText = total.toFixed(2);
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart = cart.filter(item => item.id !== id);

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCartItems();
}

function clearCart() {
    localStorage.removeItem("cart");
    displayCartItems();
}

function goToCheckout() {
    window.location.href = "checkout.html";
}

function placeOrder() {
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("emailAddress").value;
    const phone = document.getElementById("phoneNumber").value;
    const address = document.getElementById("deliveryAddress").value;

    if (!fullName || !email || !phone || !address) {
        alert("Please fill all fields");
        return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
    });

    const order = {
        name: fullName,
        email: email,
        phone: phone,
        address: address,
        items: cart,
        total: total,
        orderNumber: "ECO" + Date.now()
    };

    localStorage.setItem("currentOrder", JSON.stringify(order));

    localStorage.removeItem("cart");

    window.location.href = "order-confirmation.html";
}

function displayOrderConfirmation() {
    const order = JSON.parse(localStorage.getItem("currentOrder"));

    if (!order) return;

    document.getElementById("orderNumber").innerText = order.orderNumber;
    document.getElementById("confirmName").innerText = order.name;
    document.getElementById("confirmEmail").innerText = order.email;
    document.getElementById("confirmPhone").innerText = order.phone;
    document.getElementById("confirmAddress").innerText = order.address;
    document.getElementById("confirmTotal").innerText = order.total.toFixed(2);

    const container = document.getElementById("confirmationItems");

    order.items.forEach(item => {
        const div = document.createElement("div");

        div.className = "confirmation-item";

        div.innerHTML = `
            <h4>${item.name}</h4>
            <p>₱${item.price} × ${item.quantity}</p>
        `;

        container.appendChild(div);
    });
}

window.addEventListener("DOMContentLoaded", () => {

    displayCartItems();

    displayOrderConfirmation();

});
