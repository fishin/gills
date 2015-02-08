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
    config.post_url = internals.Reel.settings.viewPath + '/reel';
    config.view_reel = true; 
    config.angler = 'lloyd';
    config.reels = reels;
    return config;
};

exports.getReelConfig = function (reelId) {

    var reel = internals.Reel.settings.plugins.tacklebox.getReel(reelId);
    var config = {};
    var reels = internals.Reel.settings.plugins.tacklebox.getReels();
    config = {
        post_url: internals.Reel.settings.viewPath + '/reel/'+reel.id,
        id: reel.id,
        name: reel.name,
        description: reel.description,
        host: reel.host,
        directory: reel.directory,
        port: reel.port,
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
        host: payload.host,
        size: payload.size,
        description: payload.description,
        directory: payload.directory,
        port: payload.port
    };
    var createConfig = internals.Reel.settings.plugins.tacklebox.createReel(config);
    return createConfig;
};

exports.deleteReel = function (reelId) {

    internals.Reel.settings.plugins.tacklebox.deleteReel(reelId);
};

exports.updateReel = function (reelId, payload) {

    var config = {
        id: reelId,
        name: payload.name,
        host: payload.host,
        size: payload.size,
        description: payload.description,
        directory: payload.directory,
        port: payload.port
    };
    var updateConfig = internals.Reel.settings.plugins.tacklebox.updateReel(config.id, config);
    return updateConfig;
};
