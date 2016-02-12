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
var gpio = require('gpio');                 // external module
var os = require('os');                     // node module
//var https = require('https');               // node module
var querystring = require('querystring');   // node module
var email = require('emailjs');             // external module
var pad = require('pad');                   // external module
var fs = require('fs');                     // node module

// Include custom nodejs modules
var webserverHTTPS = require('./webserver/https.js');

// Various variable definitions.
var arr;

var STATE_UNKNOWN = 'Unknown';               // When door up sensor and door down sensor are closed 
                                             //   at the same time.  Should never happen.
var STATE_OPENING = 'Opening';              // Door is opening message.
var STATE_CLOSING = 'Closing';              // Door closing message.
var STATE_IN_TRANSITION = 'In Transition';  // Door in between open and closed.
var STATE_OPEN = 'Open';                    // Door open message.
var STATE_CLOSED = 'Closed';                // Door closed message.
var STATE_ERROR = 'ERROR';                  // Error message.

// FillMeIn
//var HTTPS_SERVER_PORT = 3000; // The port you want the webserver to listen on
                              //   If you do not already have something using port 443,
                              //   you can just use 443 since that is the default port for SSL

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

// More variables
var lastState = 'Unknown';
var currentState = 'Unknown';
var doorUp = 1;
var doorDown = 0;
var strDoorUp = '';
var strDoorDown = '';
var url = '';

var inDoorDownChange = false;
var inDoorUpChange = false;

var msDebounce = 400;  // number of ms to allow for debounce

var __cwd = __dirname;
console.log(strGetTimeStamp() + ' Current working directory is: ' + __cwd);

// Function used for console logging
function getTimeStamp_us() {
  var dt = new Date();
  
  var year = dt.getFullYear();
  var mon = pad(2, dt.getMonth() + 1, '0');
  var day = pad(2, dt.getDate(), '0');
  
  var hour = pad(2, dt.getHours(), '0');
  var min = pad(2, dt.getMinutes(), '0');
  var sec = pad(2, dt.getSeconds(), '0');
  
  var usec = getMilliseconds();
  return(year + mon + day + hour + min + sec + usec);
}

// Function used for console logging
function getTimeStamp() {
  var dt = new Date();
  
  var year = dt.getFullYear();
  var mon = pad(2, dt.getMonth() + 1, '0');
  var day = pad(2, dt.getDate(), '0');
  
  var hour = pad(2, dt.getHours(), '0');
  var min = pad(2, dt.getMinutes(), '0');
  var sec = pad(2, dt.getSeconds(), '0');
  
  return(year + mon + day + hour + min + sec);
}

// Function used for console logging
function strGetTimeStamp() {
  var dt = new Date();
  
  var year = dt.getFullYear();
  var mon = pad(2, dt.getMonth() + 1, '0');
  var day = pad(2, dt.getDate(), '0');
  
  var hour = pad(2, dt.getHours(), '0');
  var min = pad(2, dt.getMinutes(), '0');
  var sec = pad(2, dt.getSeconds(), '0');
  
  return('[' + year + '-' + mon + '-' + day + ' ' + hour + ':' + min + ':' + sec + ']');
}

// Last door status function
function lastStatusUpdate() {
  if ((doorDown == 0) && (doorUp == 1))
    lastState = STATE_CLOSED;
  else if ((doorDown == 1) && (doorUp == 0))
    lastState = STATE_OPEN;
  else if ((doorDown == 1) && (doorUp == 1))
    lastState = STATE_IN_TRANSITION;
  else
    lastState = STATE_UNKNOWN;
}

// Current door status function
function currentStatusUpdate() {
  if ((doorDown == 0) && (doorUp == 1)) {
    currentState = STATE_CLOSED;
  } else if ((doorDown == 1) && (doorUp == 0)) {
    currentState = STATE_OPEN;
  } else if ((doorDown == 1) && (doorUp == 1)) {
    if ((lastState == STATE_CLOSED)) {
      currentState = STATE_OPENING;
      sendEmail();
    } else if ((lastState == STATE_OPEN)) {
      currentState = STATE_CLOSING;
    }
  } else {
    currentState = STATE_UNKNOWN;
  }
  
  console.log(strGetTimeStamp() + ' Door ' + currentState + '.');
}

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
  server.send(message, function(err, message) { console.log(strGetTimeStamp() + ' ' + (err || 'Email sent.')); });
}

// The following three function blocks are where the IO pins are selected, 
//   one output pin for the relay, and two input pins, one for the Up sensor and 
//   one for the down sensor

// If you decide or need to use a different pin(s) for your setup, make sure
//   that you use a pin that is not used for anything else

// creates Door Down pin instance with direction "in"
var doorDownIf = gpio.export(27, {
  direction: "in",
  ready: function() {      
    // bind to the "change" event
    // see nodejs's EventEmitter 
    // This function gets fired when the Door "Down" sensor changes
    doorDownIf.on("change", function(value) {
      // value will report either 1 or 0 (number) when the value changes
      if (inDoorDownChange == false) {
        lastStatusUpdate();
      }
      doorDown = value / 1;
      if (inDoorDownChange == false) {   // During state change, state will "bounce"
                                          //   between 0 and 1 a few times.  Added
                                          //   function to sample value after delay.
        inDoorDownChange = true;
        setTimeout(function() {  // Debounce
          inDoorDownChange = false;
          currentStatusUpdate();
        }, msDebounce);
      }
    });
  }
});

// creates Door Up pin instance with direction "in"
var doorUpIf = gpio.export(22, {
   direction: "in",
   ready: function() {            
    // bind to the "change" event
    // see nodejs's EventEmitter 
    // This function gets fired when the Door "Up" sensor changes
    doorUpIf.on("change", function(value) {
      // value will report either 1 or 0 (number) when the value changes
      if (inDoorUpChange == false) {
        lastStatusUpdate();
      }
      doorUp = value / 1;
      if (inDoorUpChange == false) {
        inDoorUpChange = true;
        setTimeout(function() {  // Debounce
          inDoorUpChange = false;
          currentStatusUpdate();
        }, msDebounce);
      }
    });
   }
});      

// Calling export with a pin number will export that header and return a gpio header instance
var doorActuator = gpio.export(17, {
   // When you export a pin, the default direction is out. This allows you to set
   // the pin value to either LOW or HIGH (3.3V) from your program.
   direction: 'out',

   // Due to the asynchronous nature of exporting a header, you may not be able to
   // read or write to the header right away. Place your logic in this ready
   // function to guarantee everything will get fired properly
   ready: function() {
      doorActuator.set(0);                // sets pin to low (can also call gpio4.reset()
      console.log(strGetTimeStamp() + ' Door actuator is off.');
      currentStatusUpdate();
   }
});

// This is the main door operating function.
//   It toggles the relay attached to the IO pin in the function above.
//   NOTE:  REMEMBER, WHEN USING A RELAY POWERED BY OTHER THAN 3.3VDC, 
//     YOU WILL NEED TO USE A BUFFER CIRCUIT TO DRIVE THE RELAY.
//     ALSO: ALWAYS USE A DIODE ACCROSS THE RELAY TO PREVENT DAMAGE
//       TO THE CONTROLLING CURCUITS.
function operateDoor() {
  doorActuator.set();  // Activate door relay, Close switch
  console.log(strGetTimeStamp() + ' Relay closed.');
  setTimeout(function() {  // Leave on for .5 seconds
    console.log(strGetTimeStamp() + ' Relay open.');
    doorActuator.set(0);  // Shut door relay off, Open switch
  }, 500);
  console.log(strGetTimeStamp() + ' Door actuator has been toggled.');
  //currentStatusUpdate();
}



var requestHeaders;
var isAuthorized = false;


//var webhttps = new webserverHTTPS();




