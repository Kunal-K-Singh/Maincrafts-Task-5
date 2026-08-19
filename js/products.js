const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");
const pagination = document.getElementById("pagination");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
const cartCount = document.getElementById("cartCount");

let products = [];
let filteredProducts = [];
let currentPage = 1;

const productsPerPage = 8;

async function loadProducts() {
    try {
        const response = await fetch("data/products.json");

        if (!response.ok) {
            throw new Error("Unable to load products.");
        }

        products = await response.json();

        createCategoryOptions();
        applyFilters();
        updateCartCount();
    } catch (error) {
        console.error("Error loading products:", error);

        resultCount.textContent = "Unable to load products.";
        productGrid.innerHTML = "";

        emptyState.hidden = false;

        emptyState.querySelector("h2").textContent =
            "Something went wrong";

        emptyState.querySelector("p").textContent =
            "Please check the product data and try again.";
    }
}

function createCategoryOptions() {
    const categories = [
        ...new Set(products.map(product => product.category))
    ];

    categories.sort();

    categories.forEach(category => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = formatCategory(category);

        categoryFilter.appendChild(option);
    });
}

function formatCategory(category) {
    return category
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
}

function applyFilters() {
    const searchTerm = searchInput.value
        .toLowerCase()
        .trim();

    const selectedCategory = categoryFilter.value;
    const selectedSort = sortSelect.value;

    filteredProducts = products.filter(product => {
        const matchesSearch = product.title
            .toLowerCase()
            .includes(searchTerm);

        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    sortProducts(selectedSort);

    currentPage = 1;

    displayProducts();
    displayPagination();
    updateResultCount();
}

function sortProducts(sortType) {
    if (sortType === "price-asc") {
        filteredProducts.sort(
            (a, b) => a.price - b.price
        );
    }

    if (sortType === "price-desc") {
        filteredProducts.sort(
            (a, b) => b.price - a.price
        );
    }

    if (sortType === "name-asc") {
        filteredProducts.sort(
            (a, b) => a.title.localeCompare(b.title)
        );
    }

    if (sortType === "name-desc") {
        filteredProducts.sort(
            (a, b) => b.title.localeCompare(a.title)
        );
    }
}

function displayProducts() {
    productGrid.innerHTML = "";

    const startIndex =
        (currentPage - 1) * productsPerPage;

    const endIndex =
        startIndex + productsPerPage;

    const pageProducts =
        filteredProducts.slice(startIndex, endIndex);

    if (pageProducts.length === 0) {
        emptyState.hidden = false;
        return;
    }

    emptyState.hidden = true;

    pageProducts.forEach(product => {
        const productCard =
            document.createElement("article");

        productCard.className = "product-card";

        const cartItem = getCartItem(product.id);

        productCard.innerHTML = `
            <a
                href="product.html?id=${product.id}"
                class="product-image-link"
            >
                <img
                    src="${product.image}"
                    alt="${product.title}"
                    class="product-image"
                >
            </a>

            <div class="product-info">

                <span class="product-category">
                    ${formatCategory(product.category)}
                </span>

                <a
                    href="product.html?id=${product.id}"
                    class="product-name"
                >
                    ${product.title}
                </a>

                <div class="product-bottom">

                    <span class="product-price">
                        ₹${product.price.toLocaleString("en-IN")}
                    </span>

                    <div
                        class="product-cart-control"
                        data-product-id="${product.id}"
                    >
                        ${createCartControl(product.id, cartItem)}
                    </div>

                </div>

            </div>
        `;

        attachProductCartEvents(productCard, product.id);

        productGrid.appendChild(productCard);
    });
}

function createCartControl(productId, cartItem) {
    if (!cartItem) {
        return `
            <button
                class="add-cart-btn"
                data-action="add"
                data-product-id="${productId}"
            >
                Add to Cart
            </button>
        `;
    }

    return `
        <div class="quantity-control product-quantity-control">

            <button
                class="quantity-btn decrease-product"
                data-action="decrease"
                data-product-id="${productId}"
                aria-label="Decrease quantity"
            >
                −
            </button>

            <span class="product-quantity">
                ${cartItem.quantity}
            </span>

            <button
                class="quantity-btn increase-product"
                data-action="increase"
                data-product-id="${productId}"
                aria-label="Increase quantity"
            >
                +
            </button>

        </div>
    `;
}

function attachProductCartEvents(productCard, productId) {
    const control =
        productCard.querySelector(".product-cart-control");

    if (!control) {
        return;
    }

    const addButton =
        control.querySelector("[data-action='add']");

    const increaseButton =
        control.querySelector("[data-action='increase']");

    const decreaseButton =
        control.querySelector("[data-action='decrease']");

    if (addButton) {
        addButton.addEventListener("click", () => {
            updateProductQuantity(productId, 1);
        });
    }

    if (increaseButton) {
        increaseButton.addEventListener("click", () => {
            updateProductQuantity(productId, 1);
        });
    }

    if (decreaseButton) {
        decreaseButton.addEventListener("click", () => {
            updateProductQuantity(productId, -1);
        });
    }
}

function getCartItem(productId) {
    const cart =
        JSON.parse(localStorage.getItem("cart")) || [];

    return cart.find(item => item.id === productId);
}

function updateProductQuantity(productId, change) {
    let cart =
        JSON.parse(localStorage.getItem("cart")) || [];

    const existingProduct = cart.find(
        item => item.id === productId
    );

    if (existingProduct) {
        existingProduct.quantity += change;

        if (existingProduct.quantity <= 0) {
            cart = cart.filter(
                item => item.id !== productId
            );
        }
    } else if (change > 0) {
        cart.push({
            id: productId,
            quantity: 1
        });
    }

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    displayProducts();
    updateCartCount();
}

function displayPagination() {
    pagination.innerHTML = "";

    const totalPages = Math.ceil(
        filteredProducts.length / productsPerPage
    );

    if (totalPages <= 1) {
        return;
    }

    const previousButton =
        document.createElement("button");

    previousButton.textContent = "←";
    previousButton.disabled = currentPage === 1;

    previousButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;

            displayProducts();
            displayPagination();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    });

    pagination.appendChild(previousButton);

    for (let page = 1; page <= totalPages; page++) {
        const pageButton =
            document.createElement("button");

        pageButton.textContent = page;

        if (page === currentPage) {
            pageButton.classList.add("active");
        }

        pageButton.addEventListener("click", () => {
            currentPage = page;

            displayProducts();
            displayPagination();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        pagination.appendChild(pageButton);
    }

    const nextButton =
        document.createElement("button");

    nextButton.textContent = "→";
    nextButton.disabled =
        currentPage === totalPages;

    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;

            displayProducts();
            displayPagination();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    });

    pagination.appendChild(nextButton);
}

function updateResultCount() {
    const total = filteredProducts.length;

    if (total === 0) {
        resultCount.textContent = "No products found";
        return;
    }

    resultCount.textContent =
        `${total} product${total === 1 ? "" : "s"} found`;
}

function updateCartCount() {
    const cart =
        JSON.parse(localStorage.getItem("cart")) || [];

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalItems;
}

searchInput.addEventListener(
    "input",
    applyFilters
);

categoryFilter.addEventListener(
    "change",
    applyFilters
);

sortSelect.addEventListener(
    "change",
    applyFilters
);

loadProducts();