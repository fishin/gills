var internals = {};

module.exports = function() {

    this.shortDate = exports.shortDate;    
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
}

internals.pad = function(n) {

   if ((n+'').length == 1) {
       return '0' + n;
   }
   return ''+n;
};
