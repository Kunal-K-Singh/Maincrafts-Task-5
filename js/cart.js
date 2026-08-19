const cartItems = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");
const cartCount = document.getElementById("cartCount");
const cartItemCount = document.getElementById("cartItemCount");
const summaryItemCount = document.getElementById("summaryItemCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

async function loadCart() {
    try {
        const response = await fetch("data/products.json");

        if (!response.ok) {
            throw new Error("Unable to load products.");
        }

        products = await response.json();

        displayCart();
        updateCartCount();
    } catch (error) {
        console.error("Error loading cart:", error);

        cartItems.innerHTML = `
            <div class="empty-cart">
                <h2>Unable to load cart</h2>
                <p>Please try refreshing the page.</p>
            </div>
        `;
    }
}

function displayCart() {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        emptyCart.hidden = false;
        updateSummary();
        return;
    }

    emptyCart.hidden = true;

    cart.forEach(cartItem => {
        const product = products.find(
            item => item.id === cartItem.id
        );

        if (!product) {
            return;
        }

        const itemElement = document.createElement("div");

        itemElement.className = "cart-item";

        itemElement.innerHTML = `
            <img
                src="${product.image}"
                alt="${product.title}"
                class="cart-item-image"
            >

            <div class="cart-item-info">
                <span class="cart-item-category">
                    ${formatCategory(product.category)}
                </span>

                <a
                    href="product.html?id=${product.id}"
                    class="cart-item-title"
                >
                    ${product.title}
                </a>

                <p class="cart-item-price">
                    ₹${product.price.toLocaleString("en-IN")} each
                </p>
            </div>

            <div class="cart-item-actions">

                <div class="quantity-control">
                    <button
                        class="decrease-quantity"
                        data-id="${product.id}"
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>

                    <span>${cartItem.quantity}</span>

                    <button
                        class="increase-quantity"
                        data-id="${product.id}"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>
                </div>

                <span class="cart-item-total">
                    ₹${(
                        product.price * cartItem.quantity
                    ).toLocaleString("en-IN")}
                </span>

                <button
                    class="remove-item"
                    data-id="${product.id}"
                >
                    Remove
                </button>

            </div>
        `;

        cartItems.appendChild(itemElement);
    });

    attachCartEvents();
    updateSummary();
}

function attachCartEvents() {
    const increaseButtons =
        document.querySelectorAll(".increase-quantity");

    const decreaseButtons =
        document.querySelectorAll(".decrease-quantity");

    const removeButtons =
        document.querySelectorAll(".remove-item");

    increaseButtons.forEach(button => {
        button.addEventListener("click", () => {
            updateQuantity(
                Number(button.dataset.id),
                1
            );
        });
    });

    decreaseButtons.forEach(button => {
        button.addEventListener("click", () => {
            updateQuantity(
                Number(button.dataset.id),
                -1
            );
        });
    });

    removeButtons.forEach(button => {
        button.addEventListener("click", () => {
            removeFromCart(
                Number(button.dataset.id)
            );
        });
    });
}

function updateQuantity(productId, change) {
    const cartItem = cart.find(
        item => item.id === productId
    );

    if (!cartItem) {
        return;
    }

    cartItem.quantity += change;

    if (cartItem.quantity <= 0) {
        cart = cart.filter(
            item => item.id !== productId
        );
    }

    saveCart();
    displayCart();
    updateCartCount();
}

function removeFromCart(productId) {
    cart = cart.filter(
        item => item.id !== productId
    );

    saveCart();
    displayCart();
    updateCartCount();
}

function updateCartCount() {
    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalItems;
}

function updateSummary() {
    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    let subtotal = 0;

    cart.forEach(cartItem => {
        const product = products.find(
            item => item.id === cartItem.id
        );

        if (product) {
            subtotal +=
                product.price * cartItem.quantity;
        }
    });

    cartItemCount.textContent =
        `${totalItems} item${totalItems === 1 ? "" : "s"}`;

    summaryItemCount.textContent = totalItems;

    cartSubtotal.textContent =
        `₹${subtotal.toLocaleString("en-IN")}`;

    cartTotal.textContent =
        `₹${subtotal.toLocaleString("en-IN")}`;
}

function saveCart() {
    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );
}

function formatCategory(category) {
    return category
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
}

checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    alert(
        "Checkout functionality is not included in this frontend task."
    );
});

loadCart();