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
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/test');

// Try to connect to MongoDB
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:"'));
db.once('open', function(){
  // we're are connected!
  console.log("Connection To Mongodb Established");
  
  // Set Up Door Open/Close Log Schema
  var doorStatusSchema = new Schema({
    date: {
      type: Date,
      index: true
    },
    user: {
      type: String,
    },
    status: {
      type: String,
    },
    comments: [Comment],
    creator: mongoose.Schema.ObjectId
  });
  
  // Set up username list Schema
  var userSchema = new Schema({
    name: String,
    user: {
      type: String,
      index: true
      required: true,
      unique: true
    },
    password: {
      type: String
      required: true
    },
    admin: Boolean,
    created_at: Date,
    updated_at: Date
  });
  
  // Add current date to every saved entry for DoorStatus Schema
  doorStatusSchema.pre('save', function(next){
    // get the current date
    var currentDate = new Date();
    
    // if date field doesnt exist, add to that field
    if (!this.date)
      this.date = currentDate;
      
    next();
  });
  
  // Add current date to every saved entry for Users and also update the update field
  userSchema.pre('save', function(next){
    // get the current date
    var currentDate = new Date();
    
    // Update the updated_at field to current date
    this.updated_at = currentDate;
    
    // if date field doesnt exist, add to that field
    if (!this.created_at)
      this.date = currentDate;
      
    next();
  });
  
  
  // Make the schemas useful by creating a model for them
  var doorStatus = mongoose.model('DoorStatus', doorStatusSchema);
  var User = mongoose.model('User', userSchema)
  
  // Export the models so they can be used elseware in the Node application
  model.exports = DoorStatus;
  model.exports = User
  
});


