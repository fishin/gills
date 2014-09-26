var internals = {};

module.exports = function(options) {

    this.shortDate = exports.shortDate;    
    this.shortTime = exports.shortTime;    
};

exports.shortDate = function(timestamp) {

    var time = new Date(timestamp);
    var dateString = time.getFullYear() +
                     '-' + internals.pad(time.getMonth()) +
                     '-' + internals.pad(time.getDate()) +
                     ' ' + internals.pad(time.getHours()) +
                     ':' + internals.pad(time.getMinutes()) +
                     ':' + internals.pad(time.getSeconds());
    return dateString;
};

internals.pad = function(n) {

   if ((n+'').length == 1) {
       return '0' + n;
   }
   return ''+n;
};

exports.shortTime = function(ms) {

    var date = new Date(ms);
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    //return (s+'s');
    return (s);
};
