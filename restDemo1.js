const http = require("http");

function handleRequest(request, response) { //asynchronous function call
  console.log('Request object received');
  response.writeHead(200, {"Content-Type" : "text/plain"});
  //HTTP codes, browse them for reference (e.g., 400 invalid client request)
  response.write('Application Assignment 2');
  response.end();
}

http.createServer(handleRequest).listen(8080);
console.log("Node.js server running at localhost:8080");
