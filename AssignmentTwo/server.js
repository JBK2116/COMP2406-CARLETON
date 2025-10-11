//Base code server for Assignment 2, COMP 2406, Fall 2025
//author: andrew runka
//date: fall 2025

//Simple static file server to serve files from ./client directory
//e.g. http://localhost:2406/order.html serves ./client/order.html

//Run using > node server.js
//TODO: implement API routes to serve restaurant data
//      implement dynamic stats page rendering using pug
//      implement order submission handling

const http = require('http');
const fs = require('fs');
const urlLib = require('url');

