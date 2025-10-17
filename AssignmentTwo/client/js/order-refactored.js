/*
Official JS file for order.html

This JS file handles all required dynamic functionality for
the order.html `webpage`
 */

const BASEURL = "/";

/*
Below are the DOM ELEMENTS that will be manipulated
throughout the page
 */
let dropDown = document.getElementById("drop-down");

// HEADER ELEMENTS
let pageHeader = document.getElementById("header-h1");
let restaurantNameHeader = document.getElementById("restaurant-name");
let minimumOrderHeader = document.getElementById("minimum-order");
let deliveryFeeHeader = document.getElementById("delivery-fee");

// COLUMN CONTAINERS
let categoryNamesContainer = document.getElementById("category-names");
let menuItemsContainer = document.getElementById("menu-container");
let orderedItemsContainer = document.getElementById("order-items");

// ORDER SUMMARY ELEMENTS
let validationMessageElement = document.querySelector(".validation-message");
let subtotalElement = document.getElementById("subtotal-line");
let deliveryFeeElement = document.getElementById("delivery-fee-line");
let taxElement = document.getElementById("tax-line");
let orderTotalElement = document.getElementById("order-total-line");

let submitBtnElement = document.querySelector(".submit-btn");

/*
Below are the variables used for storing data from the backend
 */
let restaurants = [];
let currentRestaurant = null;
let cartItems = [];

let subtotal = 0;
let tax = 0;

/*
Below are the classes used for storing objects
 */
class CartItem {
    constructor(id, itemName, categoryName, description, price) {
        this.id = id;
        this.itemName = itemName;
        this.categoryName = categoryName;
        this.description = description;
        this.price = price;
        this.orderedQuantity = 1;
    }
}

/*
Below are the AJAX calls
 */

/**
 * Sends an AJAX request to `server.js` to retrieve all restaurant objects
 *
 * @returns {Promise<Array|null>} Array of restaurant objects if AJAX is successful, null otherwise
 */
async function getRestaurants() {
    let urlPath = `${BASEURL}restaurants`;
    try {
        const response = await fetch(urlPath);
        if (!response.ok) {
            throw new Error(`HTTP ERROR: ${response.status}`)
        }
        return await response.json();
    } catch (error) {
        console.log(`${error}`);
        return null;
    }
}

/**
 * Sends an AJAX request to `server.js` to retrieve the restaurant object with the provided id
 *
 *Sets `currentRestaurant` = returned restaurant
 * @param id - id of restaurant
 * @returns {Promise<restaurant|null>} - Restaurant object if AJAX is successful, null otherwise
 */
async function getRestaurant(id) {
    let urlPath = `${BASEURL}restaurants/${id}`;
    try {
        const response = await fetch(urlPath);
        if (!response.ok) {
            throw new Error(`Error occurred retrieving restaurant with id(${id}): HTTP ERROR${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.log(`${error}`);
        return null;
    }
}

/**
 * Submits an order to `server.js`
 *
 * @param orderDict - order dict to be submitted
 * @returns {boolean} - true if the post was successful, false otherwise
 */
async function submitOrder(orderDict) {
    let urlPath = `${BASEURL}restaurants/${orderDict.restaurantId}/orders`;

    try {
        const response = await fetch(urlPath, {
            method: "post", headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderDict)
        })
        if (!response.ok) {
            throw new Error(`Error occurred sending restaurant data (status: ${response.status})`);
        }
        return true
    } catch (error) {
        console.log(error);
        return false;
    }
}

/*
Below are the main event listeners
 */
dropDown.addEventListener("change", async () => {
    if (dropDown.value === "") {
        return;
    }
    if (cartItems.length > 0) {
        if (!confirm("Changing restaurants will clear your order. Are you sure?")) {
            dropDown.value = currentRestaurant ? currentRestaurant.id : "";
            return;
        }
    }
    let restaurant = await getRestaurant(dropDown.value);
    if (!restaurant) {
        return;
    }
    currentRestaurant = restaurant;
    handleDropDownChange();
})

function addBtnEventListener() {
    document.querySelectorAll('.menu-item .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const div = e.target.closest('.menu-item');
            const categoryName = div.dataset.categoryName;
            const itemId = div.dataset.itemId;
            // actual item
            const item = currentRestaurant.menu[categoryName][itemId];
            // item stored in cart
            let cartItem = cartItems.find((i) => i.id === itemId);
            if (!cartItem) {
                cartItem = new CartItem(itemId, item.name, categoryName, item.description, item.price);
                cartItems.push(cartItem);
                addItemDivToCart(cartItem);
            } else {
                cartItem.orderedQuantity += 1;
                updateItemDivInCart(cartItem);
            }
            updateOrderTotals(cartItem, true);
        });
    });
}

function removeBtnEvenListener() {
    // add event listener on entire container since items are added to cart AFTER restaurant data is loaded
    orderedItemsContainer.addEventListener('click', (e) => {
        // check if the click happened on a remove button
        const btn = e.target.closest('.order-item .btn');
        if (!btn) return;

        const div = btn.closest('.order-item');
        const itemId = div.dataset.itemId;

        const cartItem = cartItems.find(i => i.id === itemId);

        if (cartItem) {
            cartItem.orderedQuantity -= 1;
            if (cartItem.orderedQuantity === 0) {
                cartItems = cartItems.filter((i) => i !== cartItem);
            }
            updateItemDivInCart(cartItem);
            updateOrderTotals(cartItem, false);
        }
    });
}

submitBtnElement.addEventListener("click", () => {
    if (cartItems.length === 0) {
        return;
    }
    const order = {
        restaurantId: currentRestaurant.id, items: [],
    }
    order.items.push(...cartItems); // adds all objects in cartItems to the order.items array
    submitOrder(order);
    window.location.reload(); // reload the page to start fresh
})

/*
Below are the UI updating functions
 */

/**
 * Initializes the `drop-down` element using the global `restaurants` array
 *
 * @returns void - void
 */
function initializeDropDown() {
    for (let r of restaurants) {
        let option = document.createElement("option");
        option.value = r.id;
        option.textContent = r.name;
        dropDown.appendChild(option);
    }
}

/**
 * Handles updating the page with new information of the newly selected restaurant
 */
function handleDropDownChange() {
    updateHeaderElements();
    // clears each column
    categoryNamesContainer.innerHTML = "";
    menuItemsContainer.innerHTML = "";
    orderedItemsContainer.innerHTML = "";
    // clears cartItems
    cartItems = [];
    // clears order totals
    resetOrderTotals();
    // fill columns with new restaurants data
    updateCategoriesColumn();
    updateMenuColumn();
    // initialize the btn event handlers
    addBtnEventListener();
    removeBtnEvenListener();
}


/**
 * Updates the `HEADER ELEMENTS` of the page using the data of the `currentRestaurant` object
 */
function updateHeaderElements() {
    pageHeader.textContent = currentRestaurant.name;
    restaurantNameHeader.textContent = currentRestaurant.name;
    minimumOrderHeader.textContent = `Minimum Order: $${currentRestaurant.min_order.toFixed(2)}`;
    deliveryFeeHeader.textContent = `Delivery Fee: $${currentRestaurant.delivery_fee.toFixed(2)}`;
    deliveryFeeElement.textContent = `$${currentRestaurant.delivery_fee.toFixed(2)}`;
}

/**
 * Updates the `category-names` ul column using the data of the `currentRestaurant`
 */
function updateCategoriesColumn() {
    for (let cName in currentRestaurant.menu) {
        let li = document.createElement("li");
        let a = document.createElement("a");
        a.href = `#${cName}`;
        a.textContent = cName;

        li.appendChild(a);
        categoryNamesContainer.appendChild(li);
    }
}

/**
 * Updates the `menu-container` column using the data of `currentRestaurant`
 */
function updateMenuColumn() {
    for (let cName in currentRestaurant.menu) {
        let catContainer = document.createElement("div");
        catContainer.className = "menu-category";
        catContainer.id = `${cName}`;

        let catHeader = document.createElement("h4");
        catHeader.className = "category-header";
        catHeader.textContent = cName;
        catContainer.appendChild(catHeader);

        for (let id in currentRestaurant.menu[cName]) {
            let item = currentRestaurant.menu[cName][id];
            let itemContainer = document.createElement("div");
            itemContainer.className = "menu-item";
            itemContainer.dataset.categoryName = cName; // access via element.dataset.categoryName
            itemContainer.dataset.itemId = id; // access via element.dataset.itemId

            let itemNameContainer = document.createElement("p");
            itemNameContainer.className = "item-info";
            itemNameContainer.textContent = item.name;

            let itemPriceContainer = document.createElement("p");
            itemPriceContainer.className = "item-info";
            itemPriceContainer.textContent = `$${item.price.toFixed(2)}`;

            let itemDescContainer = document.createElement("p");
            itemDescContainer.className = "item-info";
            itemDescContainer.textContent = `${item.description}`;

            let addBtn = document.createElement("button");
            addBtn.className = "btn";

            let img = document.createElement("img");
            img.alt = "add button img";
            img.src = "../images/add.png";
            addBtn.appendChild(img);

            itemContainer.append(itemNameContainer, itemPriceContainer, itemDescContainer, addBtn);
            catContainer.appendChild(itemContainer);
        }
        menuItemsContainer.appendChild(catContainer);
    }
}

/**
 * Adds an `order-item` div to the `orderedItems` container
 * @param cartItem - CartItem object
 */
function addItemDivToCart(cartItem) {
    let itemContainer = document.createElement("div");
    itemContainer.className = "order-item";
    itemContainer.dataset.categoryName = cartItem.categoryName; // access via element.dataset.categoryName
    itemContainer.dataset.itemId = cartItem.id; // access via element.dataset.itemId

    let itemDetailsContainer = document.createElement("div");
    itemDetailsContainer.className = "order-item-details";

    let itemNameContainer = document.createElement("span");
    itemNameContainer.className = "item-name";
    itemNameContainer.textContent = `${cartItem.itemName}`;

    let itemQuantityContainer = document.createElement("span");
    itemQuantityContainer.className = "item-quantity";
    itemQuantityContainer.textContent = `Quantity: ${cartItem.orderedQuantity}`;

    let itemTotalContainer = document.createElement("span");
    itemTotalContainer.className = "item-total";
    itemTotalContainer.textContent = `Price: $${(cartItem.price * cartItem.orderedQuantity).toFixed(2)}`;

    let removeBtn = document.createElement("button");
    removeBtn.className = "btn remove-btn";
    let removeImg = document.createElement("img");
    removeImg.alt = "remove button img";
    removeImg.className = "order-item-image";
    removeImg.src = "../images/remove.png";

    removeBtn.appendChild(removeImg);
    // create the structure according to the HTML snippet
    itemDetailsContainer.append(itemNameContainer, itemQuantityContainer, itemTotalContainer);
    itemContainer.append(itemDetailsContainer, removeBtn);

    orderedItemsContainer.appendChild(itemContainer);
}

/**
 * Updates an `.order-item` div in the cart.
 * Removes the `.order-item` div IF cartItem.orderedQuantity === 0
 *
 * @param cartItem - cartItem being manipulated
 */
function updateItemDivInCart(cartItem) {
    const itemDiv = orderedItemsContainer.querySelector(`.order-item[data-item-id="${cartItem.id}"]`);
    const itemQuantityContainer = itemDiv.querySelector(".item-quantity");
    const itemTotalContainer = itemDiv.querySelector(".item-total");

    if (cartItem.orderedQuantity === 0) itemDiv.remove();

    itemQuantityContainer.textContent = `Quantity: ${cartItem.orderedQuantity}`;
    itemTotalContainer.textContent = `Price: $${(cartItem.price * cartItem.orderedQuantity).toFixed(2)}`;
}

/**
 * Updates the totals in the #order-totals container.
 *
 * This function is to be called when adding or removing an Item from the order summary
 *
 * @param cartItem - The Item object being added or removed
 * @param add - Boolean value set to true to indicate Item is being added else item is being removed
 */
function updateOrderTotals(cartItem, add) {
    if (add) {
        subtotal += cartItem.price;
    } else {
        subtotal -= cartItem.price;
    }
    tax = subtotal * 0.13;
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    updateFinalOrderTotal();
}

/**
 * Updates the final order total
 *
 * Additionally, controls the display of the submitBtn and validationElement
 */
function updateFinalOrderTotal() {
    let finalOrderTotal = subtotal + tax + currentRestaurant.delivery_fee;
    orderTotalElement.textContent = `$${finalOrderTotal.toFixed(2)}`;
    if (subtotal >= currentRestaurant.min_order) {
        validationMessageElement.style.display = "none";
        submitBtnElement.style.display = "inline-block";
    } else {
        validationMessageElement.style.display = "block";
        validationMessageElement.textContent = `
        Minimum order of $${currentRestaurant.min_order.toFixed(2)} not met. Add $${(currentRestaurant.min_order - subtotal).toFixed(2)} 
        to checkout.
        `;
        submitBtnElement.style.display = "none";
    }
}

function resetOrderTotals() {
    // reset tracking variables
    subtotal = 0;
    tax = 0;
    // reset visual elements
    validationMessageElement.style.display = "none";
    validationMessageElement.textContent = "";
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    orderTotalElement.textContent = `$00.00`;
    submitBtnElement.style.display = "none";
}

window.addEventListener("DOMContentLoaded", async () => {
    let allRestaurants = await getRestaurants();
    if (allRestaurants) {
        for (let r of allRestaurants) {
            restaurants.push(r);
        }
        initializeDropDown();
    }
})
