const productImage = document.getElementById("productImage");
const productTitle = document.getElementById("productTitle");
const productCategory = document.getElementById("productCategory");
const productPrice = document.getElementById("productPrice");
const productDescription = document.getElementById("productDescription");
const addToCartBtn = document.getElementById("addToCartBtn");
const cartMessage = document.getElementById("cartMessage");
const cartCount = document.getElementById("cartCount");

const productDetails = document.getElementById("productDetails");
const productError = document.getElementById("productError");

const productId = new URLSearchParams(
    window.location.search
).get("id");

let selectedProduct = null;

async function loadProduct() {
    try {
        const response = await fetch("data/products.json");

        if (!response.ok) {
            throw new Error("Unable to load products.");
        }

        const products = await response.json();

        selectedProduct = products.find(
            product => product.id === Number(productId)
        );

        if (!selectedProduct) {
            showProductError();
            return;
        }

        displayProduct();
        updateCartControl();
        updateCartCount();

    } catch (error) {
        console.error("Error loading product:", error);
        showProductError();
    }
}

function displayProduct() {
    productImage.src = selectedProduct.image;
    productImage.alt = selectedProduct.title;

    productTitle.textContent =
        selectedProduct.title;

    productCategory.textContent =
        formatCategory(selectedProduct.category);

    productPrice.textContent =
        `₹${selectedProduct.price.toLocaleString("en-IN")}`;

    productDescription.textContent =
        selectedProduct.description;

    document.title =
        `${selectedProduct.title} - ShopEase`;
}

function formatCategory(category) {
    return category
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
}

function getCart() {
    return JSON.parse(
        localStorage.getItem("cart")
    ) || [];
}

function updateCartControl() {
    const cart = getCart();

    const cartItem = cart.find(
        item => item.id === selectedProduct.id
    );

    if (!cartItem) {
        addToCartBtn.style.display = "inline-block";
        addToCartBtn.textContent = "Add to Cart";

        removeQuantityControl();

        return;
    }

    addToCartBtn.style.display = "none";

    createQuantityControl(cartItem.quantity);
}

function createQuantityControl(quantity) {
    removeQuantityControl();

    const quantityControl =
        document.createElement("div");

    quantityControl.className =
        "quantity-control detail-quantity-control";

    quantityControl.innerHTML = `
        <button
            class="quantity-btn"
            id="decreaseQuantity"
            aria-label="Decrease quantity"
        >
            −
        </button>

        <span class="product-quantity">
            ${quantity}
        </span>

        <button
            class="quantity-btn"
            id="increaseQuantity"
            aria-label="Increase quantity"
        >
            +
        </button>
    `;

    addToCartBtn.parentNode.insertBefore(
        quantityControl,
        addToCartBtn.nextSibling
    );

    document
        .getElementById("increaseQuantity")
        .addEventListener("click", () => {
            updateQuantity(1);
        });

    document
        .getElementById("decreaseQuantity")
        .addEventListener("click", () => {
            updateQuantity(-1);
        });
}

function removeQuantityControl() {
    const existingControl =
        document.querySelector(
            ".detail-quantity-control"
        );

    if (existingControl) {
        existingControl.remove();
    }
}

function addToCart() {
    updateQuantity(1);
}

function updateQuantity(change) {
    let cart = getCart();

    const existingProduct = cart.find(
        item => item.id === selectedProduct.id
    );

    if (existingProduct) {
        existingProduct.quantity += change;

        if (existingProduct.quantity <= 0) {
            cart = cart.filter(
                item => item.id !== selectedProduct.id
            );
        }
    } else if (change > 0) {
        cart.push({
            id: selectedProduct.id,
            quantity: 1
        });
    }

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    updateCartControl();
    updateCartCount();

    if (change > 0) {
        showCartMessage("Added to cart!");
    }
}

function updateCartCount() {
    const cart = getCart();

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalItems;
}

function showCartMessage(message) {
    cartMessage.textContent = message;
    cartMessage.classList.add("show");

    setTimeout(() => {
        cartMessage.classList.remove("show");
    }, 1500);
}

function showProductError() {
    productDetails.hidden = true;
    productError.hidden = false;
}

addToCartBtn.addEventListener(
    "click",
    addToCart
);

loadProduct();