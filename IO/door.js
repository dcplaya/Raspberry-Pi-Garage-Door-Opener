// Door status code

// Define exports variable so I can export and use these in other files
var exports = module.exports = {};

//Required modules
var gpio = require('gpio');                 // external module
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

// More variables
var lastState = 'Unknown';
var currentState = 'Unknown';
var doorUp = 1;
var doorDown = 0;
var strDoorUp = '';
var strDoorDown = '';


var inDoorDownChange = false;
var inDoorUpChange = false;

var msDebounce = 400;  // number of ms to allow for debounce


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
        exports.lastStatusUpdate();
      }
      doorDown = value / 1;
      if (inDoorDownChange == false) {   // During state change, state will "bounce"
                                          //   between 0 and 1 a few times.  Added
                                          //   function to sample value after delay.
        inDoorDownChange = true;
        setTimeout(function() {  // Debounce
          inDoorDownChange = false;
          exports.currentStatusUpdate();
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
        exports.lastStatusUpdate();
      }
      doorUp = value / 1;
      if (inDoorUpChange == false) {
        inDoorUpChange = true;
        setTimeout(function() {  // Debounce
          inDoorUpChange = false;
          exports.currentStatusUpdate();
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
      console.log(consoleLog.strGetTimeStamp() + ' Door actuator is off.');
      exports.currentStatusUpdate();
   }
});

// This is the main door operating function.
//   It toggles the relay attached to the IO pin in the function above.
//   NOTE:  REMEMBER, WHEN USING A RELAY POWERED BY OTHER THAN 3.3VDC, 
//     YOU WILL NEED TO USE A BUFFER CIRCUIT TO DRIVE THE RELAY.
//     ALSO: ALWAYS USE A DIODE ACCROSS THE RELAY TO PREVENT DAMAGE
//       TO THE CONTROLLING CURCUITS.
exports.operateDoor = function() {
//function operateDoor() {
  doorActuator.set();  // Activate door relay, Close switch
  console.log(consoleLog.strGetTimeStamp() + ' Relay closed.');
  setTimeout(function() {  // Leave on for .5 seconds
    console.log(consoleLog.strGetTimeStamp() + ' Relay open.');
    doorActuator.set(0);  // Shut door relay off, Open switch
  }, 500);
  console.log(consoleLog.strGetTimeStamp() + ' Door actuator has been toggled.');
  //currentStatusUpdate();
}

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
      //sendEmail();                    Commented out temporaily
    } else if ((lastState == STATE_OPEN)) {
      currentState = STATE_CLOSING;
    }
  } else {
    currentState = STATE_UNKNOWN;
  }
  
  console.log(consoleLog.strGetTimeStamp() + ' Door ' + currentState + '.');
// Log the status change to the database
  //var doorStatus = require('../mongoDB');
  var doorChange = new mongoDB.doorStatus({
    user: 'Admin',
    status: currentState,
  });
  
  // Have to save it to the database
  doorChange.save(function(err){
    if (err) throw err;
    console.log('Door Status Change Saved To Database!!');
  });
  
  // Exports
  module.exports.currentState = currentState;
}


// List all variables that I need to export
//module.exports.currentState = currentState;
module.exports.lastState = lastState;
