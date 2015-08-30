var internals = {};

module.exports = internals.Reel = function (options) {

    this.settings = options;
    internals.Reel.settings = options;
    internals.Reel.createReel = options.Utils.Reel.createReel;
    internals.Reel.updateReel = options.Utils.Reel.updateReel;
    internals.Reel.deleteReel = options.Utils.Reel.deleteReel;
    internals.Reel.getReelConfig = options.Utils.Reel.getReelConfig;
    internals.Reel.getReelCreateConfig = options.Utils.Reel.getReelCreateConfig;
    this.createReel = exports.createReel;
    this.updateReel = exports.updateReel;
    this.deleteReel = exports.deleteReel;
    this.getReelView = exports.getReelView;
    this.getReelCreateView = exports.getReelCreateView;
};

exports.getReelView = function (request, reply) {

    internals.Reel.getReelConfig(request.params.reelId, function (config) {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getReelCreateView = function (request, reply) {

    internals.Reel.getReelCreateConfig(function (config) {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.createReel = function (request, reply) {

    internals.Reel.createReel(request.payload, function (createConfig) {

        return reply.redirect(internals.Reel.settings.viewPath + '/reel/' + createConfig.id);
    });
};

exports.deleteReel = function (request, reply) {

    internals.Reel.deleteReel(request.params.reelId, function () {

        return reply.redirect(internals.Reel.settings.viewPath + '/jobs');
    });
};

exports.updateReel = function (request, reply) {

    internals.Reel.updateReel(request.params.reelId, request.payload, function (updateConfig) {

        return reply.redirect(internals.Reel.settings.viewPath + '/reel/' + updateConfig.id);
    });
};
