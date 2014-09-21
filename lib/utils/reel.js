var internals = {};

module.exports = internals.Reel = function(options) {

   this.settings = options;
   internals.Reel.settings = options;
   this.createReel = exports.createReel;
   this.updateReel = exports.updateReel;
   this.deleteReel = exports.deleteReel;
   this.getReelConfig = exports.getReelConfig;
};

exports.getReelConfig = function (reel_id) {

    var reel = {};
    var config = {};
    var reels = internals.Reel.settings.plugins.tacklebox.getReels();
    var reelList = [];
    for (var i = 0; i < reels.length; i++) {
       var reel = internals.Reel.settings.plugins.tacklebox.getReel(reels[i]);
       reelList.push(reel);
    }
    if (reel_id) {
        reel = internals.Reel.settings.plugins.tacklebox.getReel(reel_id);
        config = {
            post_url: '/gills/reel/'+reel.id,
            id: reel.id,
            name: reel.name,
            description: reel.description,
            size: reel.size
        };
    }
    else {
        config.post_url = '/gills/reel';
    }
    config.view_reel = true; 
    config.angler = 'lloyd';
    config.reels = reelList;
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
