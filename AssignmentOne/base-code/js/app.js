import {restaurants} from "./client.js"

// DOM ELEMENTS
let dropDown = document.getElementById("drop-down");

let pageHeader = document.getElementById("header-h1");
let restaurantNameHeader = document.getElementById("restaurant-name");
let minimumOrderHeader = document.getElementById("minimum-order");
let deliveryFeeHeader = document.getElementById("delivery-fee");

let categoryNamesContainer = document.getElementById("category-names");
let menuItemsContainer = document.getElementById("menu-container");

// Javascript Variables
let currentRestaurant;

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
        currentRestaurant = restaurants.find((r) => r.name === dropDown.value);
        resetCategoryNamesList();
        resetMenuContainer();
        
        initializeMainHeaders();
        initializeCategoryAndMenu();
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
    for (let category in currentRestaurant.menu) {
        let categoryListItem = createCategoryListItem(category);
        let categoryDiv = createMenuCategoryDiv(category);
        for (let itemID in currentRestaurant.menu[category]) {
            let itemObj = currentRestaurant.menu[category][itemID];
            let itemDiv = createMenuItemDiv(itemObj.name);
            categoryDiv.appendChild(itemDiv);
        }
        categoryNamesContainer.appendChild(categoryListItem);
        menuItemsContainer.appendChild(categoryDiv);
    }
    
    
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
 * Creates a new `#menu-item` div using the provided arguments
 * 
 * @param menuItemName - The name of the menu item
 * 
 * @returns The created and filled `#menu-item` div
 */
function createMenuItemDiv(menuItemName) {
    
    let menuItemDiv = document.createElement("div");
    menuItemDiv.className = `menu-item`;

    let innerDivHTMLText = document.createElement("p");
    innerDivHTMLText.className = `item-info`;
    innerDivHTMLText.textContent = menuItemName;

    let innerDivButton = document.createElement("button");
    innerDivButton.className = `add-btn`;

    let buttonImage = document.createElement("img");
    buttonImage.alt = `add button img`;
    buttonImage.src = "images/add.png";
    innerDivButton.appendChild(buttonImage);

    menuItemDiv.appendChild(innerDivHTMLText);
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