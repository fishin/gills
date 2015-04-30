var Wreck = require('wreck');

var internals = {};

module.exports = internals.Common = function (options) {

    this.settings = options;
    internals.Common.settings = options;
    this.getCommonConfig = exports.getCommonConfig;
};

exports.getCommonConfig = function (cb) {

    Wreck.get(internals.Common.settings.api.url + '/reels', { json: 'force' }, function (err, resp, pl) {

        var reels = [];
        if (pl !== null && !pl.statusCode) {
            reels = pl;
        }
        Wreck.get(internals.Common.settings.api.url + '/queue', { json: 'force' }, function (err, resp, pl) {

            //console.log(pl);
            var queue = [];
            if (pl !== null && !pl.statusCode) {
                queue = pl;
            }
            var config = {
                reels: reels,
                queue: queue
            };
            return cb(config);
        });
    });
};
