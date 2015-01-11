var Queue = require('./queue');

var internals = {};

module.exports = internals.Common = function(options) {

   this.settings = options;
   internals.Common.settings = options;
   var queue = new Queue(options);
   internals.Common.getQueue = queue.getQueue;
   this.getCommonConfig = exports.getCommonConfig;
   this.shortDate = exports.shortDate;
};

exports.getCommonConfig = function () {

    var config = {};
    config.angler = 'lloyd',
    config.queue = internals.Common.getQueue();
    config.reels = internals.Common.settings.plugins.tacklebox.getReels();
    return config;
};

exports.shortDate = function(timestamp) {

    var time = new Date(timestamp);

    var dateString = time.getFullYear() +
                     '-' + internals.pad(time.getMonth()+1) +
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
   else {
       return ''+n;
   }
};
