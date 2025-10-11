// run server via 'node server.js'
const restaurantObjs = [];

const port = 8000;
const host = "localhost";
const restaurantsDirPath = "./restaurants";

const http = require('http');
const fs = require('fs');
const urlLib = require('url');
const path = require('path');

readRestaurantInfo();

// block executed on every incoming request
const server = http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    res.end("You are connected to the server....");
})
// block executed on server startup
server.listen(port, host, () => {
    console.log(`Server running at https://${host}:${port}`);
    console.log(restaurantObjs);
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
            restaurantObjs.push(JSON.parse(data));
        });
    } catch (err) {
        console.log(`Error reading restaurant files: ${err}`);
    }
}
