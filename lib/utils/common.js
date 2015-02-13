var Queue = require('./queue');

var internals = {};

module.exports = internals.Common = function(options) {

   this.settings = options;
   internals.Common.settings = options;
   var queue = new Queue(options);
   internals.Common.getQueue = queue.getQueue;
   this.getCommonConfig = exports.getCommonConfig;
};

exports.getCommonConfig = function () {

    var config = {};
    config.angler = 'lloyd',
    config.queue = internals.Common.getQueue();
    config.reels = internals.Common.settings.plugins.tacklebox.getReels();
    return config;
};
