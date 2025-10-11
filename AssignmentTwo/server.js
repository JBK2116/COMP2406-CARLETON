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


const serverContext = {
    rootDir: "./client/",
    port: 2406
};

function send404(res,err) {
    res.writeHead(404);
    res.end("404 Not Found"+err);
}
function send500(res,err) {
    res.writeHead(500);
    res.end("500 Server Error"+err);
}


http.createServer((req, res) => {
    
    let url = urlLib.parse(req.url, true);
    
    //TODO: implement API routes here
    //if(url.pathname === '/'|| url.pathname === '/index.html'){    
    //} else {

    //static server for client files
    //determine requested file's path
    let filepath = serverContext.rootDir + url.pathname;
    
    //get file from filesystem
    fs.readFile(filepath, (err, data) => {
        if(err) {
            send404(res,err);
            return;
        }  
        //determine content type based on file extension
        let ext = filepath.split('.').pop();
        let contentType = 'text/plain';
        if(ext === 'html') contentType = 'text/html';
        else if(ext === 'css') contentType = 'text/css';
        else if(ext === 'js') contentType = 'application/javascript';
        //add more content types as needed

        //send file contents
        res.writeHead(200, {'Content-Type': contentType});
        res.end(data);
    });

}).listen(serverContext.port);
console.log(`Server running at http://localhost:${serverContext.port}/`);
