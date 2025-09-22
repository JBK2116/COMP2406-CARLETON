import {aragorn, legolas, frodo, restaurants} from "./client.js"

// DOM ELEMENTS
let dropDown = document.getElementById("restaurant-dropdown");
let selectedRestaurant;

let restaurantName = document.getElementById("restaurant-name");
let deliveryFee = document.getElementById("delivery-fee");
let minOrder = document.getElementById("min-order");

let categoriesList = document.getElementById("categories-list");
let menuList = document.getElementById("menu-content");
let orderList = document.getElementById("order-items");

// FUNCTIONS
function initializeDropDown() {
    for (let restaurant of restaurants) {
        let option = document.createElement("option");
        option.value = restaurant.name;
        option.textContent = restaurant.name;
        dropDown.appendChild(option)
    }
}

function updateHeaders(restaurantObj) {
    selectedRestaurant = restaurants.find(r => r.name === dropDown.value);
    restaurantName.textContent = selectedRestaurant.name;
    minOrder.textContent = `Min Order: $${selectedRestaurant.min_order}`;
    deliveryFee.textContent = `Delivery Fee: $${selectedRestaurant.delivery_charge}`;
    document.getElementById("restaurant-info").style.display = "block";
}

function initializeCategories(restaurantObj) {
    // TODO: Implement This
}

function initializeMenu(restaurantObj) {
    // TODO: Implement This
}

// EVENT HANDLERS
dropDown.addEventListener("change", updateHeaders);

function initializePage() {
    initializeDropDown();
}

document.addEventListener("DOMContentLoaded", initializePage)
