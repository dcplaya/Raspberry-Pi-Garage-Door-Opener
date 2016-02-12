// Required Modules
var pad = require('pad');                   // external module

// Define exports variable so I can export and use these in other files
var exports = module.exports = {};

// Function used for console logging
exports.getTimeStamp_us = function() {
//function getTimeStamp_us() {
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
exports.getTimeStamp = function() {
//function getTimeStamp() {
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
exports.strGetTimeStamp = function() {
//function strGetTimeStamp() {
  var dt = new Date();
  
  var year = dt.getFullYear();
  var mon = pad(2, dt.getMonth() + 1, '0');
  var day = pad(2, dt.getDate(), '0');
  
  var hour = pad(2, dt.getHours(), '0');
  var min = pad(2, dt.getMinutes(), '0');
  var sec = pad(2, dt.getSeconds(), '0');
  
  return('[' + year + '-' + mon + '-' + day + ' ' + hour + ':' + min + ':' + sec + ']');
}