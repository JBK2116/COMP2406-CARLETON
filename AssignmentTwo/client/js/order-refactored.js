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

/*
Below are the main event listeners
 */
dropDown.addEventListener("change", async () => {
    if (dropDown.value === "") {
        return;
    }
    let restaurant = await getRestaurant(dropDown.value);
    if (!restaurant) {
        return;
    }
    currentRestaurant = restaurant;
    handleDropDownChange();
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
    updateCategoriesColumn();
}



/**
 * Updates the `HEADER ELEMENTS` of the page using the data of the `currentRestaurant` object
 */
function updateHeaderElements() {
    pageHeader.textContent = currentRestaurant.name;
    restaurantNameHeader.textContent = currentRestaurant.name;
    minimumOrderHeader.textContent = `Minimum Order: $${currentRestaurant.min_order.toFixed(2)}`;
    deliveryFeeHeader.textContent = `Delivery Fee: $${currentRestaurant.delivery_fee.toFixed(2)}`;
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

function updateMenuColumn() {
    for (let cName in currentRestaurant.menu) {
        let catContainer = document.createElement("div");
        catContainer.className = "menu-category";
        catContainer.id = `${cName}`;

        let catHeader = document.createElement("h4");
        catHeader.className = "category-header";
        catHeader.textContent = cName;

        for (let id in currentRestaurant.menu[cName]) {
            let item = currentRestaurant.menu[cName][id];

            let itemContainer = document.createElement("div");
            itemContainer.className = "menu-item";

            let itemPriceContainer = document.createElement("p");
            itemPriceContainer.className = "item-info";
            itemPriceContainer.textContent = `$${item.price.toFixed(2)}`;

            let itemDescContainer = document.createElement("p");
            itemDescContainer.className = "item-info";
            itemDescContainer.textContent = `${item.desc}`;

            let itemNameContainer = document.createElement("p");
            itemNameContainer.className = "item-info";
            itemNameContainer.textContent = `${item.name}`;

            // TODO: Add button and finish implementing
            // Dont forget to add data values to keep track of category name and item ID

        }
    }
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
