var Wreck = require('wreck');

var internals = {};

module.exports = internals.Reel = function (options) {

    this.settings = options;
    internals.Reel.settings = options;
    this.createReel = exports.createReel;
    this.updateReel = exports.updateReel;
    this.deleteReel = exports.deleteReel;
    this.getReelConfig = exports.getReelConfig;
    this.getReelCreateConfig = exports.getReelCreateConfig;
};

exports.getReelCreateConfig = function (cb) {

    var reel = {};
    var config = {};
    Wreck.get(internals.Reel.settings.api.url + '/reels', function (err, resp, pl) {

        var reels = JSON.parse(pl);
        config.url = internals.Reel.settings.viewPath + '/reel';
        config.method = 'post';
        config.viewReel = true;
        config.angler = 'lloyd';
        config.reels = reels;
        return cb(config);
    });
};

exports.getReelConfig = function (reelId, cb) {

    Wreck.get(internals.Reel.settings.api.url + '/reel/' + reelId, function (err, resp, pl) {

        var reel = JSON.parse(pl);
        var config = {};
        Wreck.get(internals.Reel.settings.api.url + '/reels', function (err, resp, pl) {

            var reels = JSON.parse(pl);
            config = {
                url: internals.Reel.settings.viewPath + '/reel/' + reel.id,
                method: 'post',
                id: reel.id,
                name: reel.name,
                description: reel.description,
                host: reel.host,
                directory: reel.directory,
                port: reel.port,
                size: reel.size
            };
            config.viewReel = true;
            config.angler = 'lloyd';
            config.reels = reels;
            return cb(config);
        });
    });
};

exports.createReel = function (payload, cb) {

    var config = {
        name: payload.name,
        host: payload.host,
        size: parseInt(payload.size),
        description: payload.description,
        directory: payload.directory,
        port: parseInt(payload.port)
    };
    Wreck.post(internals.Reel.settings.api.url + '/reel', { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify(config) }, function (err, resp, pl) {

        var createConfig = JSON.parse(pl);
        return cb(createConfig);
    });
};

exports.deleteReel = function (reelId, cb) {

    Wreck.delete(internals.Reel.settings.api.url + '/reel/' + reelId, function (err, resp, pl) {

        return cb();
    });
};

exports.updateReel = function (reelId, payload, cb) {

    var config = {
        name: payload.name,
        host: payload.host,
        size: parseInt(payload.size),
        description: payload.description,
        directory: payload.directory,
        port: parseInt(payload.port)
    };
    Wreck.put(internals.Reel.settings.api.url + '/reel/' + reelId, { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify(config) }, function (err, resp, pl) {

        var updateConfig = JSON.parse(pl);
        return cb(updateConfig);
    });
};
