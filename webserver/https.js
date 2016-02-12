//Splitting out the https server setup from the main door-if.js to help clean things up and make it module

var https = require('https');               // node module
var fs = require('fs');                     // node module
var querystring = require('querystring');   // node module
var os = require('os');                     // node module

var HTTPS_SERVER_PORT = 3000; // The port you want the webserver to listen on
                              //   If you do not already have something using port 443,
                              //   you can just use 443 since that is the default port for SSL

var __cwd = __dirname;
var docRoot = '/docRoot/';


// This is the main file request function for the HTTP server.
function fileRequest (response, fileName, notFound) {
  notFound = typeof notFound !== 'undefined' ? notFound : false;
  console.log(strGetTimeStamp() + ' Request file, ' + fileName);
  var data = "";
  
  fs.exists(fileName, function(exists) {
    if (exists) {
      console.log(strGetTimeStamp() + ' File: ' + fileName + ' exists.');
      fs.stat(fileName, function(error, stats) {
        console.log(strGetTimeStamp() + ' File: ' + fileName + ', Size: ' + stats.size);
        fs.open(fileName, "r", function(error, fd) {
          console.log(strGetTimeStamp() + ' File: ' + fileName + ', Open for reading.');
          var buffer = new Buffer(stats.size);
          fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
            data = buffer.toString("utf8", 0, buffer.length);
            fs.close(fd);
            //if (bytesRead == stats.size) {
              console.log(strGetTimeStamp() + ' File: ' + fileName + ', ' + bytesRead + ' of ' + stats.size + ' Bytes Read.');
              response.write(data);
              response.end();
          });
        });
      });
    }
    else if (notFound == false) {
      console.log(strGetTimeStamp() + ' File not found');
      fileRequest (response, __cwd + '/status/404.html', true);
    }
    else {
      console.log(strGetTimeStamp() + ' Requested file not found. Additionally, error file was not found.');
      response.write('Internal Error.');
      response.end();
    }
  });
}

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
  //console.log(strGetTimeStamp() + ' Page, ' + url + ' Requested from, ' + request.connection.remoteAddress);
  var postData = [];
  var getData = [];
  /*if (isAuthorized) {
    console.log(requestHeaders['authorization']);
    if (requestHeaders['authorization'] != 'Basic ' + BASIC_AUTH_CODED_STRING) { 
      response.writeHead(401, {'Content-Type': 'text/html',
        'WWW-Authenticate': 'Basic realm="localhost"'});
      var fileName = __cwd + "/status/401.html";
      fileRequest(response, fileName);
      return;
    }
    //console.log(strGetTimeStamp() + ' User @ ' + request.connection.remoteAddress + ' has been authorized.');
  }*/
  
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

  //console.log(strGetTimeStamp() + ' ' + fileName + ' requested.');
  
  if (fileName == 'getDoor.json') { 
    // application/json 
    response.writeHead(200, {'Content-Type': 'application/json'});
    //console.log(strGetTimeStamp() + ' Door status requested...');
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

