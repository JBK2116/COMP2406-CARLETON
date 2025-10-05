import {restaurants} from "./client.js"

// DOM ELEMENTS
let dropDown = document.getElementById("drop-down");

let pageHeader = document.getElementById("header-h1");
let restaurantNameHeader = document.getElementById("restaurant-name");
let minimumOrderHeader = document.getElementById("minimum-order");
let deliveryFeeHeader = document.getElementById("delivery-fee");

let categoryNamesContainer = document.getElementById("category-names");
let menuItemsContainer = document.getElementById("menu-container");

let validationMessageElement = document.querySelector(".validation-message");
let orderedItemsContainer = document.getElementById("order-items");
let subtotalElement = document.getElementById("subtotal-line");
let deliveryFeeElement = document.getElementById("delivery-fee-line");
let taxElement = document.getElementById("tax-line");
let orderTotalElement = document.getElementById("order-total-line");
let submitBtnElement = document.querySelector(".submit-btn");

// Javascript Variables
let currentRestaurant;
let items = [];
let subtotal = 0;
let deliveryFee = 0;
let tax = 0;

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
        let anItemOrdered = checkOrderedItem();

        if (anItemOrdered) {
            if (!confirm("Changing restaurants will clear your order. Are you sure?")) {
                dropDown.value = currentRestaurant.name;
                return;
            }

        }
        if (dropDown.value === "") {
            currentRestaurant = null;
            items.length = 0;
            resetMainHeaders();
            resetCategoryNamesList();
            resetMenuContainer();
            clearOrderItems();
            resetOrderTotals();
            return;
        }
        currentRestaurant = restaurants.find((r) => r.name === dropDown.value);

        // clear items trackers
        items.length = 0;

        resetCategoryNamesList();
        resetMenuContainer();
        clearOrderItems();
        resetOrderTotals();
        
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
    deliveryFeeElement.textContent = `$${currentRestaurant.delivery_charge.toFixed(2)}`;
    deliveryFee = currentRestaurant.delivery_charge;
    updateFinalOrderTotal();
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
 * It additionally initializes the submit-btn
 */
function initializeOrderSummary() {
    initializeSubmitBtn();
    let menuItemContainers = menuItemsContainer.querySelectorAll(".menu-item");
    menuItemContainers.forEach((container) => {
        let addBtn = container.querySelector("img");
        addBtn.addEventListener("click", () => {
            let itemObj = items[container.dataset.index];
            itemObj.orderedQuantity += 1;
            let existingOrderItemDiv = getOrderItemDiv(container.dataset.index);
            if (existingOrderItemDiv) {
                updateOrderItemDiv(itemObj, existingOrderItemDiv)
            } else {
                addOrderItemDiv(itemObj, container.dataset.index);
            }
            updateOrderTotals(itemObj, true);
        })
    })
}

/**
 * This function initializes the event handler for submit btn
 */
function initializeSubmitBtn() {
    submitBtnElement.addEventListener("click", () => {
        if (subtotal > currentRestaurant.min_order) {
            alert("Your Order Has Been Submitted")
            location.reload();
        } else {
            // Do Nothing
        }
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
 * It additionally configures an event handler for its associated `remove btn`
 *
 * @param Item - The Item object to add
 * @param index - The index of the item in the `items` array
 */
function addOrderItemDiv(Item, index) {
    let orderItemRootContainer = document.createElement("div");
    orderItemRootContainer.dataset.index = index;
    orderItemRootContainer.className = "order-item";

    let orderItemDetailsContainer = document.createElement("div");
    orderItemDetailsContainer.className = "order-item-details";

    let itemNameContainer = document.createElement("span");
    itemNameContainer.className = "item-name";
    itemNameContainer.textContent = `${Item.name}`;
    let itemQuantityContainer = document.createElement("span");
    itemQuantityContainer.className = "item-quantity";
    itemQuantityContainer.textContent = `Quantity: ${Item.orderedQuantity}`;
    let itemPriceContainer = document.createElement("span");
    itemPriceContainer.className = "item-total";
    itemPriceContainer.textContent = `Price: $${Item.price.toFixed(2)}`;

    let removeBtn = document.createElement("button");
    removeBtn.className = "btn remove-btn";

    let removeBtnImage = document.createElement("img");
    removeBtnImage.alt = "item";
    removeBtnImage.class = "order-item-image";
    removeBtnImage.src = "images/remove.png";

    removeBtn.appendChild(removeBtnImage);

    orderItemDetailsContainer.append(itemNameContainer, itemQuantityContainer, itemPriceContainer);
    orderItemRootContainer.append(orderItemDetailsContainer, removeBtn);

    orderedItemsContainer.appendChild(orderItemRootContainer);

    removeBtn.addEventListener("click", () => {
        removeOrderItemDiv(Item, orderItemRootContainer)
    })

}

/**
 * This helper function updates the details of an `.order-item` div in the order-summary column
 *
 * @param Item - The Item object belong to the div
 * @param Div - The Div element storing the details
 */
function updateOrderItemDiv(Item, Div) {
    let quantitySpan = Div.querySelector(".item-quantity");
    let priceSpan = Div.querySelector(".item-total");
    quantitySpan.textContent = `Quantity: ${Item.orderedQuantity}`;
    priceSpan.textContent = `Price: $${(Item.price * Item.orderedQuantity).toFixed(2)}`;
}

/**
 * This helper function handles removing `.order-items` from the order summary column
 * @param Item - The Item object to remove
 * @param Div - The Div of the `.order-item`
 */
function removeOrderItemDiv(Item, Div) {
    Item.orderedQuantity -= 1;
    if (Item.orderedQuantity === 0) {
        Div.remove()
    } else {
        updateOrderItemDiv(Item, Div)
    }
    updateOrderTotals(Item, false);
}

/**
 * This function updates the totals in the #order-totals container. This
 * function is to be called when adding or removing an Item from the order summary
 *
 * @param Item - The Item object being added or removed
 * @param add - Boolean value set to true to indicate Item is being added else item is being removed
 */
function updateOrderTotals(Item, add) {
    if (add) {
        subtotal += Item.price;
    } else {
        subtotal -= Item.price;
    }
    tax = subtotal * 0.13;
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    updateFinalOrderTotal();
}

function updateFinalOrderTotal() {
    let finalOrderTotal = subtotal + tax + deliveryFee;
    orderTotalElement.textContent = `$${finalOrderTotal.toFixed(2)}`;
    if (subtotal >= currentRestaurant.min_order) {
        validationMessageElement.style.display = "none";
    } else {
        validationMessageElement.style.display = "block";
        validationMessageElement.textContent = `
        Minimum order of $${currentRestaurant.min_order.toFixed(2)} not met. Add $${(currentRestaurant.min_order - subtotal).toFixed(2)} 
        to checkout.
        `;
    }
}

/**
 * This function retrieves the `.order-item` div with the matching index data attribute
 *
 *@param index - The index of the Item
 *@returns HTMLDivElement - The matching `order-item` div
 */
function getOrderItemDiv(index) {
    return orderedItemsContainer.querySelector(`#order-items > div[data-index="${index}"]`);
}

/**
 * This function checks to see if any items have been added to be ordered
 * It utilizes the orderedQuantity attribute of each Item
 * @returns boolean - True if any Item has orderedQuantity > 0 else False
 */
function checkOrderedItem() {
    for (let item of items) {
        if (item.orderedQuantity > 0) {
            return true;
        }
    }
    return false;
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

/**
 * This function resets the order totals
 */
function resetOrderTotals() {
    subtotal = 0;
    tax = 0
    deliveryFee = 0;
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    deliveryFeeElement.textContent = "$00.00";
    validationMessageElement.style.display = "none";
    orderTotalElement.textContent = `$00.00`;
}

/**
 * This function resets the `#order-items` div by removing its innerHTML
 */
function clearOrderItems() {
    orderedItemsContainer.innerHTML = "";
}


window.addEventListener("DOMContentLoaded", initializeDropDown)