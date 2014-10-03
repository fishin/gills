var internals = {};

module.exports = internals.Reel = function(options) {

   this.settings = options;
   internals.Reel.settings = options;
   this.createReel = exports.createReel;
   this.updateReel = exports.updateReel;
   this.deleteReel = exports.deleteReel;
   this.getReelConfig = exports.getReelConfig;
   this.getReelCreateConfig = exports.getReelCreateConfig;
};

exports.getReelCreateConfig = function () {

    var reel = {};
    var config = {};
    var reels = internals.Reel.settings.plugins.tacklebox.getReels();
    config.post_url = '/gills/reel';
    config.view_reel = true; 
    config.angler = 'lloyd';
    config.reels = reels;
    return config;
};

exports.getReelConfig = function (reel_id) {

    var reel = {};
    var config = {};
    var reels = internals.Reel.settings.plugins.tacklebox.getReels();
    config = {
        post_url: '/gills/reel/'+reel.id,
        id: reel.id,
        name: reel.name,
        description: reel.description,
        size: reel.size
    };
    config.view_reel = true; 
    config.angler = 'lloyd';
    config.reels = reels;
    return config;
};

exports.createReel = function (payload) {

    var config = {
        name: payload.name,
        description: payload.description,
        lines: payload.lines
    };
    var createConfig = internals.Reel.settings.plugins.tacklebox.createReel(config);
    return createConfig;
};

exports.deleteReel = function (reel_id) {

    internals.Reel.settings.plugins.tacklebox.deleteReel(reel_id);
};

exports.updateReel = function (reel_id, payload) {

    var config = {
        id: reel_id,
        name: payload.name,
        description: payload.description
    };
    var updateConfig = internals.Reel.settings.plugins.tacklebox.updateReel(config.id, config);
    return updateConfig;
};
