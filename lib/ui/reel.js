var Utils = require('../utils');

var internals = {};

module.exports = internals.Reel = function(options) {

   this.settings = options;
   internals.Reel.settings = options;
   var utils = new Utils(options);
   internals.Reel.createReel = utils.Reel.createReel;
   internals.Reel.updateReel = utils.Reel.updateReel;
   internals.Reel.deleteReel = utils.Reel.deleteReel;
   internals.Reel.getReelConfig = utils.Reel.getReelConfig;
   internals.Reel.getReelCreateConfig = utils.Reel.getReelCreateConfig;
   this.createReel = exports.createReel;
   this.updateReel = exports.updateReel;
   this.deleteReel = exports.deleteReel;
   this.getReelView = exports.getReelView;
   this.getReelCreateView = exports.getReelCreateView;
};

exports.getReelView = function (request, reply) {

    internals.Reel.getReelConfig(request.params.reelId, function(config) {

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

    internals.Reel.createReel(request.payload, function(createConfig) {

        return reply.redirect(internals.Reel.settings.viewPath + '/reel/' + createConfig.id);
    });
};

exports.deleteReel = function (request, reply) {

    internals.Reel.deleteReel(request.params.reelId, function() {

        return reply.redirect(internals.Reel.settings.viewPath + '/jobs');
    });
};

exports.updateReel = function (request, reply) {

    internals.Reel.updateReel(request.params.reelId, request.payload, function(updateConfig) {

        return reply.redirect(internals.Reel.settings.viewPath + '/reel/' + updateConfig.id);
    });
};
