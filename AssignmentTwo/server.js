// run server via 'node server.js'

// url definitions
const port = 8000;
const host = "localhost";
const restaurantsDirPath = "./restaurants";

// required packages
const http = require('http');
const fs = require('fs');
const urlLib = require('url');
const path = require('path');

// in-memory variables
const restaurants = [];
const stats = [];

// custom objects
class RestaurantStat {
    constructor(restaurant) {
        this.id = restaurant.id;
        this.restaurant = restaurant;
        this.totalOrderAmount = 0; // tracks the total money received from orders (subtotal %10 tax + delivery fee)
        this.orderCount = 0; // tracks total amount of orders received
        this.orderedItems = new Map(); // tracks the amount of units sold per item in the menu
    }
}
// Load restaurant info before server startup
readRestaurantInfo();

// block executed on every incoming request
const server = http.createServer((req, res) => {
    const parsedUrl = urlLib.parse(req.url, true);
    /*
    splits the `parsedUrl` by `/` then filters out all empty spots in the array
    example: /restaurants/id -> ["restaurants", "id]
     */
    const pathParts = parsedUrl.pathname.split('/').filter(part => part);

    if (req.method === 'GET') {
        // ! Add additional url routing below
        if (pathParts.length === 0) {
            fs.readFile('./index.html', 'utf-8', (err, data) => {
                if (err) {
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.end('Error loading home page.');
                    return;
                }
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(data);
            });
            return;
        } else if (pathParts[0] === "restaurants" && pathParts.length === 1) {
            // path equivalent to `/restaurants
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(restaurants));
            return;
        } else if (pathParts[0] === "restaurants" && !isNaN(pathParts[1]) && pathParts.length === 2) {
            // path equivalent to `/restaurant/:id`
            let restaurant = restaurants.find(r => (r.id === Number(pathParts[1])));
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(restaurant));
            return;
        }


        // Serve extra static files
        let filePath = '.' + req.url;
        const extname = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
        };
        const contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, extname === '.png' ? null : 'utf-8', (err, data) => {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('File not found.');
                return;
            }
            res.writeHead(200, {'Content-Type': contentType});
            res.end(data);
        });
    } else if (req.method === "POST") {
        // currently only handles one endpoint so default to that endpoint
        // endpoint is /restaurants/:id/orders
        let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
        })
        req.on("end", () => {
            // entire raw body has been received
            try {
                const order = JSON.parse(body);
                const restaurant = restaurants.find((r) => r.id === order.restaurantId);

                let stat = stats.find((r) => r.id === restaurant.id);
                if (!stat) {
                    stat = new RestaurantStat(restaurant);
                    stats.push(stat);
                }
                let orderSubtotal = 0;
                let taxPercent = 0.10;
                for (const item of order.items) {
                    // each `item` is a CartItem object
                    orderSubtotal += item.price*item.orderedQuantity;
                    stat.orderedItems.set(item.id, (stat.orderedItems.get(item.id) ?? 0) + item.orderedQuantity);
                }
                // update stat values
                let orderTotal = orderSubtotal + stat.restaurant.delivery_fee + (orderSubtotal*taxPercent);
                stat.totalOrderAmount += orderTotal;
                stat.orderCount++;
                // response
                console.log(stat.totalOrderAmount);
                console.log(stat.orderCount);
                res.writeHead(201)
                res.end();
            } catch (error) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'Invalid JSON'}));
            }
        })

    } else {
        res.writeHead(405, {'Content-Type': 'text/plain'});
        res.end('Method Not Allowed');
    }
});

// block executed on server startup
server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
})

/**
 * Reads all the .json files in the restaurants dir, converts them into JSON objects and pushes them
 * to the `restaurantObjs` list
 *
 * - Note: This function runs entirely synchronously
 */
function readRestaurantInfo() {
    try {
        const files = fs.readdirSync(restaurantsDirPath);
        files.forEach(file => {
            if (path.extname(file) !== '.json') return;
            const data = fs.readFileSync(`${restaurantsDirPath}/${file}`, {encoding: "utf-8"});
            restaurants.push(JSON.parse(data));
        });
    } catch (err) {
        console.log(`Error reading restaurant files: ${err}`);
    }
}
