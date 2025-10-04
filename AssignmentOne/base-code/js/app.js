import {restaurants} from "./client.js"

// DOM ELEMENTS
let dropDown = document.getElementById("drop-down");

let pageHeader = document.getElementById("header-h1");
let restaurantNameHeader = document.getElementById("restaurant-name");
let minimumOrderHeader = document.getElementById("minimum-order");
let deliveryFeeHeader = document.getElementById("delivery-fee");

let categoryNamesContainer = document.getElementById("category-names");
let menuItemsContainer = document.getElementById("menu-container");

let orderSummaryContainer = document.getElementById("order-items");


// Javascript Variables
let currentRestaurant;
let items = [];
let orderedItems = [];

class Item {
    constructor(name, description, price) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.orderedQuantity = 0;
    }
}

/**
 * This function initializes the drop-down element by appending 3 new options to it and
 * setting up it's "change" event listener
 *
 * The 3 new options are dynamically created from the restaurant names.
 * The "change" event listener handles detecting the current selected restaurant.
 */
function initializeDropDown() {
    for (let r in restaurants) {
        let option = document.createElement("option")
        option.value = restaurants[r].name;
        option.textContent = restaurants[r].name;
        dropDown.appendChild(option);
    }
    dropDown.addEventListener("change", () => {
        if (dropDown.value === "") {
            resetMainHeaders();
            resetCategoryNamesList();
            resetMenuContainer();
            return;
        }
        currentRestaurant = restaurants.find((r) => r.name === dropDown.value);

        // clear items trackers
        items.length = 0;
        orderedItems.length = 0;

        resetCategoryNamesList();
        resetMenuContainer();

        initializeMainHeaders();
        initializeCategoryAndMenu();
        initializeOrderSummary();
    })
}

/**
 * This functions updates the main restaurant headers
 *
 * The header information is set to the currently selected restaurant.
 */
function initializeMainHeaders() {
    pageHeader.textContent = currentRestaurant.name;
    restaurantNameHeader.textContent = currentRestaurant.name;
    minimumOrderHeader.textContent = `Minimum Order: $${currentRestaurant.min_order.toFixed(2)}`;
    deliveryFeeHeader.textContent = `Delivery Fee: $${currentRestaurant.delivery_charge.toFixed(2)}`;
}

/**
 * This function displays the categories and menu items of the current selected restaurant
 */
function initializeCategoryAndMenu() {
    let menuItemIndex = 0; // This maps each .menu-item div to its corresponding Item object in the list
    for (let category in currentRestaurant.menu) {
        let categoryListItem = createCategoryListItem(category);
        let categoryDiv = createMenuCategoryDiv(category);
        for (let itemID in currentRestaurant.menu[category]) {
            let itemObj = currentRestaurant.menu[category][itemID];
            let itemDiv = createMenuItemDiv(itemObj.name, itemObj.price, itemObj.description);
            itemDiv.dataset.index = menuItemIndex.toString();
            categoryDiv.appendChild(itemDiv);
            items.push(new Item(itemObj.name, itemObj.description, itemObj.price));
            menuItemIndex++
        }
        categoryNamesContainer.appendChild(categoryListItem);
        menuItemsContainer.appendChild(categoryDiv);
    }
}

/**
 * This function initializes the event handlers for the .order-summary container
 */
function initializeOrderSummary() {
    let menuItemContainers = menuItemsContainer.querySelectorAll(".menu-item");
    menuItemContainers.forEach((container) => {
        let addBtn = container.querySelector("img");
        addBtn.addEventListener("click",() => {
            let itemObj = items[container.dataset.index];
            addOrderItemDiv(itemObj, container.dataset.index);
        })
    })
}

/**
 * Creates a new HTML `<li>` element using the provided category name
 *
 * The returned element is to be used in the category menu column
 *
 * @param {string} categoryName - The name of the category
 *
 * @returns {HTMLLIElement} The created `<li>` element
 */
function createCategoryListItem(categoryName) {
    let listItem = document.createElement("li");
    let a = document.createElement("a");
    a.href = `#${categoryName}`
    a.textContent = categoryName;
    listItem.appendChild(a);
    return listItem;
}

/**
 * Creates a new `.menu-item` div using the provided arguments
 *
 * @param menuItemName - The name of the menu item
 * @param menuItemPrice - The price of the menu item
 * @param menuItemDesc - The quantity of the menu item
 *
 * @returns The created and filled `.menu-item` div
 */
function createMenuItemDiv(menuItemName, menuItemPrice, menuItemDesc) {

    let menuItemDiv = document.createElement("div");
    menuItemDiv.className = `menu-item`;

    let innerDivItemName = document.createElement("p");
    innerDivItemName.className = `item-info`;
    innerDivItemName.textContent = menuItemName;

    let innerDivItemPrice = document.createElement("p");
    innerDivItemPrice.className = `item-info`;
    innerDivItemPrice.textContent = `$${menuItemPrice.toFixed(2)}`;

    let innerDivItemDesc = document.createElement("p");
    innerDivItemDesc.className = `item-info`;
    innerDivItemDesc.textContent = `${menuItemDesc}`;

    let innerDivButton = document.createElement("button");
    innerDivButton.className = `btn`;

    let buttonImage = document.createElement("img");
    buttonImage.alt = `add button img`;
    buttonImage.src = "images/add.png";
    innerDivButton.appendChild(buttonImage);

    menuItemDiv.appendChild(innerDivItemName);
    menuItemDiv.appendChild(innerDivItemPrice);
    menuItemDiv.appendChild(innerDivItemDesc);
    menuItemDiv.appendChild(innerDivButton);
    return menuItemDiv;


}

/**
 * Creates and fills a new `#menu-category` div using the provided arguments
 *
 * @param categoryName - The name of the category
 *
 * @returns {HTMLDivElement} The created and filled `#menu-category` div
 */
function createMenuCategoryDiv(categoryName) {
    // Parent Container
    let rootDiv = document.createElement("div");
    rootDiv.id = `${categoryName}`;
    rootDiv.className = `menu-category`;

    // Container Header
    let rootDivHeader = document.createElement("h4");
    rootDivHeader.className = `category-header`;
    rootDivHeader.textContent = categoryName;

    rootDiv.appendChild(rootDivHeader);
    return rootDiv;
}

/**
 * This helper function creates and adds an #order-item div to the #order-items container
 *
 * @param Item - The Item object to add
 * @param index - The index of the item in the `items` array
 */
function addOrderItemDiv(item, index) {
    let orderItemRootContainer = document.createElement("div");
    orderItemRootContainer.dataset.index = index;
    orderItemRootContainer.className = "order-item";

    let orderItemDetailsContainer = document.createElement("div");
    orderItemDetailsContainer.className = "order-item-details";
    
    let itemNameContainer = document.createElement("span");
    itemNameContainer.className = "item-name";
    itemNameContainer.textContent = `${item.name}`;
    let itemQuantityContainer = document.createElement("span");
    itemQuantityContainer.className = "item-quantity";
    itemQuantityContainer.textContent = `Quantity: ${item.orderedQuantity}`;
    let itemPriceContainer = document.createElement("span");
    itemPriceContainer.className = "item-total";
    itemPriceContainer.textContent = `Price: $${item.price.toFixed(2)}`;
    
    let removeBtn = document.createElement("button");
    removeBtn.className = "btn remove-btn";
    
    let removeBtnImage = document.createElement("img");
    removeBtnImage.alt = "item";
    removeBtnImage.class = "order-item-image";
    removeBtnImage.src = "images/remove.png";
    
    removeBtn.appendChild(removeBtnImage);
    
    orderItemDetailsContainer.append(itemNameContainer, itemQuantityContainer, itemPriceContainer);
    orderItemRootContainer.append(orderItemDetailsContainer, removeBtn);

    orderSummaryContainer.appendChild(orderItemRootContainer);
}

/**
 * This helper function removes an #order-item div from the #order-items container
 *
 * @param Item - The Item object to remove
 */
function removeOrderItemDiv(item) {
    // TODO: Implement This
}

/**
 * This function updates the totals in the #order-totals container. This
 * function is to be called when adding or removing an Item from the order summary
 *
 * @param Item - The Item object being added or removed
 */
function updateOrderTotals(Item) {
    // TODO: Implement This
}

/**
 * This functions resets all main headers to default values
 *
 * Main headers include all elements with `<h2 class="main-header">`
 * Default values are the values showcased on initial page load
 */
function resetMainHeaders() {
    pageHeader.textContent = "No Restaurant Selected";
    restaurantNameHeader.textContent = "No Name";
    minimumOrderHeader.textContent = "Minimum Order: $0"
    deliveryFeeHeader.textContent = "Delivery Fee: $0";
}

/**
 * This function removes all elements in the `#category-names` list
 */
function resetCategoryNamesList() {
    categoryNamesContainer.innerHTML = "";
}

/**
 * This function removes all elements in the `#menu-container` div
 */
function resetMenuContainer() {
    menuItemsContainer.innerHTML = "";
}


window.addEventListener("DOMContentLoaded", initializeDropDown)