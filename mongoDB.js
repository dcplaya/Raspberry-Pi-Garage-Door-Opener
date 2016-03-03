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

// Set up mongoose conneciton to mongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

// Try to connect to MongoDB
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:"'));
db.once('open', function(){
  // we're are connected!
  console.log("Connection To Mongodb Established");
});


