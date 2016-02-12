//Splitting out the https server setup from the main door-if.js to help clean things up and make it module

var https = require('https');               // node module
var fs = require('fs');                     // node module
var querystring = require('querystring');   // node module

var HTTPS_SERVER_PORT = 3000; // The port you want the webserver to listen on
                              //   If you do not already have something using port 443,
                              //   you can just use 443 since that is the default port for SSL

//var https = function() {
    
//};


// Options for the HTTPS server. 
var options = {
  key: fs.readFileSync('./key.pem', 'utf8'),
  cert: fs.readFileSync('./server.crt', 'utf8')
};

// This is the main HTTPS server function and entrypoint to this app.
//   It listens on the specified port for incoming requests and responds 
//   according to the type of request being made.
https.createServer(options, function (request, response) {
  request.setEncoding('utf8');
  requestHeaders = request.headers;
  console.log(strGetTimeStamp() + ' Page, ' + url + ' Requested from, ' + request.connection.remoteAddress);
  var postData = [];
  var getData = [];
  if (isAuthorized) {
    console.log(requestHeaders['authorization']);
    if (requestHeaders['authorization'] != 'Basic ' + BASIC_AUTH_CODED_STRING) { 
      response.writeHead(401, {'Content-Type': 'text/html',
        'WWW-Authenticate': 'Basic realm="localhost"'});
      var fileName = __cwd + "/status/401.html";
      fileRequest(response, fileName);
      return;
    }
    console.log(strGetTimeStamp() + ' User @ ' + request.connection.remoteAddress + ' has been authorized.');
  }
  
  if(request.method === "POST") {
    var data = "";

    request.on("data", function(chunk) {
      data += chunk;
    });

    request.on("end", function() {
      console.log(postData);
      
      console.log("raw: " + decodeURIComponent(data));
      var json = querystring.parse(data);

      console.log("json: " + json);
    });
  }

  url = request.url;
  arr = url.split('/');
  fileName = arr[arr.length-1]; //.toLowerCase();
  arr = fileName.split('?');
  fileName = arr[0];
  arr = arr.splice(0, 1);
  getArgs = arr.join();
  
  if ((fileName == '/') || (fileName == '')) {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fileName = 'mainDoor.html';
  }

  console.log(strGetTimeStamp() + ' ' + fileName + ' requested.');
  
  if (fileName == 'getDoor.json') { 
    // application/json 
    response.writeHead(200, {'Content-Type': 'application/json'});
    console.log(strGetTimeStamp() + ' Door status requested...');
    response.write(currentState);
    response.end();
  }
  else if (fileName == 'operateDoor.json') {
    response.writeHead(200, {'Content-Type': 'application/json'});
    operateDoor();
    response.end();
  }
  else if (fileName.split('.')[fileName.split('.').length-1].toLowerCase() == 'css') {
    response.writeHead(200, {'Content-Type': 'text/css'});
    fileRequest(response, __cwd + docRoot + fileName);
  }
  else {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fileRequest(response, __cwd + docRoot + fileName);
  }
}).listen(HTTPS_SERVER_PORT);

console.log('Server started.');

//Exports the https contructor from this module
module.exports = https;

