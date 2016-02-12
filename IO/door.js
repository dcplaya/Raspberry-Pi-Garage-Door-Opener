// Door status code

// Define exports variable so I can export and use these in other files
var exports = module.exports = {};

//Required modules
var consoleLog = require('../ConsoleLogging/consoleLog.js');


// Needed variables
var STATE_UNKNOWN = 'Unknown';               // When door up sensor and door down sensor are closed 
                                             //   at the same time.  Should never happen.
var STATE_OPENING = 'Opening';              // Door is opening message.
var STATE_CLOSING = 'Closing';              // Door closing message.
var STATE_IN_TRANSITION = 'In Transition';  // Door in between open and closed.
var STATE_OPEN = 'Open';                    // Door open message.
var STATE_CLOSED = 'Closed';                // Door closed message.
var STATE_ERROR = 'ERROR';                  // Error message.




// Last door status function
exports.lastStatusUpdate = function() {
//function lastStatusUpdate() {
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
exports.currentStatusUpdate = function() {
//function currentStatusUpdate() {
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
