// run server via 'node server.js'
const restaurantObjs = [];

const port = 8000;
const host = "localhost";
const restaurantsDirPath = "./restaurants";

const http = require('http');
const fs = require('fs');
const urlLib = require('url');
const path = require('path');

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
            res.end(JSON.stringify(restaurantObjs));
            return;
        } else if (pathParts[0] === "restaurants" && !isNaN(pathParts[1]) && pathParts.length === 2) {
            // path equivalent to `/restaurant/:id`
            let restaurant = restaurantObjs.find(r => (r.id === Number(pathParts[1])));
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
    } else {
        res.writeHead(405, {'Content-Type': 'text/plain'});
        res.end('Method Not Allowed');
    }
});

// block executed on server startup
server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
    console.log(restaurantObjs);
})

/**
 * This object represents a singular Item in a restaurants menu category
  */
class Item {
    constructor(name, description, price) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.orderedQuantity = 0;
    }
}

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
            restaurantObjs.push(JSON.parse(data));
        });
    } catch (err) {
        console.log(`Error reading restaurant files: ${err}`);
    }
}
