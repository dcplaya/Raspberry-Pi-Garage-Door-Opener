// This source code is provided as-is with no warranty whatsoever.
//
// This source code may be modified, and redistributed provided this license
//   remains intact.  The creator of this code will in no way be held responsible for
//   any repercussions that may result from or due to the use of this code.  It is up 
//   to the end user to read and understand what this code "does".  Since every environment
//   is different, modification of this code to match the user's environment will 
//   more than likely be a necessity.  IF THIS CODE IS NOT AT LEAST READ THROUGH, 
//   AND OR MODIFIED, DAMAGE TO THE USER'S PERSONAL PROPERTY COULD RESULT.
//
// Please post or read the accompanying documentation at:
//   http://wp.me/p3oAnz-5

// Include other nodejs modules and external modules.
var os = require('os');                     // node module
//var https = require('https');               // node module
var querystring = require('querystring');   // node module
var email = require('emailjs');             // external module
var pad = require('pad');                   // external module
var fs = require('fs');                     // node module

// Include custom nodejs modules
var consoleLog = require('./ConsoleLogging/consoleLog.js');
var doorIO = require('./IO/door.js');
// Various variable definitions.
var arr;

//*********************** Webserver variables**********************
var https = require('https');               // node module
var fs = require('fs');                     // node module
var querystring = require('querystring');   // node module
var os = require('os');                     // node module
var consoleLog = require('./ConsoleLogging/consoleLog.js');

var HTTPS_SERVER_PORT = 3000; // The port you want the webserver to listen on
                              //   If you do not already have something using port 443,
                              //   you can just use 443 since that is the default port for SSL

var __cwd = __dirname;
var docRoot = '/docRoot/';

var requestHeaders;
var isAuthorized = false;
//************************* End Webserver variables************************

// set to false to disable the email function, true to enable
var SEND_EMAILS = false;

// FillMeIn
var EMAIL_HOST = ''; // Enter your SMTP Server Here, example: 'mail.yahoo.com'

// FillMeIn
var EMAIL_FROM = ''; // Enter your from email address, example: 'John Doe <johndoe@yahoo.com>'

// FillMeIn
var EMAIL_TO = ''; // Enter the recipient(s) here, example: 'John Doe <johndoe@yahoo.com>, Jane Doe <janedoe@yahoo.com>'

// FillMeIn
var EXTERNAL_WEBSITE_ADDRESS = '';  // Example: 'http://My.Home.Router:8080', Your router must be configured correctly for this to work
                                    //   You can use either you external IP address, or you DNS name.  Remember,
                                    //   if you use the IP address and you do not have a static IP, this address may have to 
                                    //   be updated regularly.  You could use a dynamic DNS provider like http://dyn.com

// FillMeIn
var BASIC_AUTH_CODED_STRING = 'VHJleDRCb2I=';  // This is to set your password for the site
  // With the code above, you would use the following username and password to login to this server:
  //   username: admin
  //   password: password
  // PLEASE CHANGE THIS!!!!  (Generate your own code at: http://www.base64encode.org/)

var EMAIL_SSL = false;

// You may need to enter this if your email provider requires it.  Leave if blank and if it does not work, try it with this
var EMAIL_USER = '';

// You may need to enter this if your email provider requires it.  Leave if blank and if it does not work, try it with this
var EMAIL_PASSWORD = '';

var EMAIL_HTML_DOOR_OPENING = '<a href="' + EXTERNAL_WEBSITE_ADDRESS + '">View Status...</a>';
var EMAIL_SUBJECT_DOOR_OPENING = 'Garage Door is Opening...';
var EMAIL_BODY_DOOR_OPENING = 'Your Garage Door Is Opening...';

var __cwd = __dirname;
console.log(consoleLog.strGetTimeStamp() + ' Current working directory is: ' + __cwd);



// Main email function
function sendEmail () {
  if (SEND_EMAILS == false) {
    return;
  }
  
  var server = email.server.connect({
    user: EMAIL_USER,
    password: EMAIL_PASSWORD,
    host: EMAIL_HOST,
    ssl: EMAIL_SSL
  });
  
  var message = {
    text: EMAIL_BODY_DOOR_OPENING,
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject: EMAIL_SUBJECT_DOOR_OPENING,
    attachment:
    [
      {data:EMAIL_BODY_DOOR_OPENING + '<br />' + EMAIL_HTML_DOOR_OPENING, alternative:true}
    ]
  };
  server.send(message, function(err, message) { console.log(consoleLog.strGetTimeStamp() + ' ' + (err || 'Email sent.')); });
}


//////// WEBSERVER Code //////////////////////
// This is the main file request function for the HTTP server.
function fileRequest (response, fileName, notFound) {
  notFound = typeof notFound !== 'undefined' ? notFound : false;
  console.log(consoleLog.strGetTimeStamp() + ' Request file, ' + fileName);
  var data = "";
  
  fs.exists(fileName, function(exists) {
    if (exists) {
      console.log(consoleLog.strGetTimeStamp() + ' File: ' + fileName + ' exists.');
      fs.stat(fileName, function(error, stats) {
        console.log(consoleLog.strGetTimeStamp() + ' File: ' + fileName + ', Size: ' + stats.size);
        fs.open(fileName, "r", function(error, fd) {
          console.log(consoleLog.strGetTimeStamp() + ' File: ' + fileName + ', Open for reading.');
          var buffer = new Buffer(stats.size);
          fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
            data = buffer.toString("utf8", 0, buffer.length);
            fs.close(fd);
            //if (bytesRead == stats.size) {
              console.log(consoleLog.strGetTimeStamp() + ' File: ' + fileName + ', ' + bytesRead + ' of ' + stats.size + ' Bytes Read.');
              response.write(data);
              response.end();
          });
        });
      });
    }
    else if (notFound == false) {
      console.log(consoleLog.strGetTimeStamp() + ' File not found');
      fileRequest (response, __cwd + '/status/404.html', true);
    }
    else {
      console.log(consoleLog.strGetTimeStamp() + ' Requested file not found. Additionally, error file was not found.');
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
  console.log(consoleLog.strGetTimeStamp() + ' Page, ' + url + ' Requested from, ' + request.connection.remoteAddress);
  var postData = [];
  var getData = [];
  if (!isAuthorized) {
    //console.log(requestHeaders['authorization']);
    if (requestHeaders['authorization'] != 'Basic ' + BASIC_AUTH_CODED_STRING) { // 
      response.writeHead(401, {'Content-Type': 'text/html',
        'WWW-Authenticate': 'Basic realm="localhost"'});
      var fileName = __cwd + "/status/401.html";
      fileRequest(response, fileName);
      return;
    }
    console.log(consoleLog.strGetTimeStamp() + ' User @ ' + request.connection.remoteAddress + ' has been authorized.');
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
    response.writeHead(200, {'Content-Type': 'text/html',
      'WWW-Authenticate': 'Basic realm="localhost"'});
    fileName = 'mainDoor.html';
  }

  console.log(consoleLog.strGetTimeStamp() + ' ' + fileName + ' requested.');
  
  if (fileName == 'getDoor.json') { 
    // application/json 
    response.writeHead(200, {'Content-Type': 'application/json',
      'WWW-Authenticate': 'Basic realm="localhost"'});
    console.log(consoleLog.strGetTimeStamp() + ' Door status requested...');
    response.write(doorIO.currentState);
    response.end();
  }
  else if (fileName == 'operateDoor.json') {
    response.writeHead(200, {'Content-Type': 'application/json',
      'WWW-Authenticate': 'Basic realm="localhost"'});
    doorIO.operateDoor();
    response.end();
  }
  else if (fileName.split('.')[fileName.split('.').length-1].toLowerCase() == 'css') {
    response.writeHead(200, {'Content-Type': 'text/css',
      'WWW-Authenticate': 'Basic realm="localhost"'});
    fileRequest(response, __cwd + docRoot + fileName);
  }
  else {
    response.writeHead(200, {'Content-Type': 'text/html',
      'WWW-Authenticate': 'Basic realm="localhost"'});
    fileRequest(response, __cwd + docRoot + fileName);
  }
}).listen(HTTPS_SERVER_PORT);

console.log('Server started.');




