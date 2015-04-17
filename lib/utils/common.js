var Wreck = require('wreck');
var Queue = require('./queue');

var internals = {};

module.exports = internals.Common = function(options) {

   this.settings = options;
   internals.Common.settings = options;
   var queue = new Queue(options);
   internals.Common.getQueue = queue.getQueue;
   this.getCommonConfig = exports.getCommonConfig;
};

exports.getCommonConfig = function (cb) {

    Wreck.get(internals.Common.settings.api.url + '/reels', function(err, resp, pl) {

        var config = {};
        config.queue = internals.Common.getQueue();
        if (pl) {
            config.reels = JSON.parse(pl);
        }
        return cb(config);
    });
};
