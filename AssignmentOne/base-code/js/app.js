import {restaurants} from "./client.js"

// ELEMENTS
let dropDown = document.getElementById("drop-down");

let pageHeader = document.getElementById("header-h1");
let restaurantNameHeader = document.getElementById("restaurant-name");
let minimumOrderHeader = document.getElementById("minimum-order");
let deliveryFeeHeader = document.getElementById("delivery-fee");


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
        currentRestaurant = restaurants.find((r) => r.name === dropDown.value)
        initializeMainHeaders();
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


window.addEventListener("DOMContentLoaded", initializeDropDown)