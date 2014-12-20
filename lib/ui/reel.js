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

    var config = internals.Reel.getReelConfig(request.params.reelId);
    reply.view('layout', config);
};

exports.getReelCreateView = function (request, reply) {

    var config = internals.Reel.getReelCreateConfig();
    reply.view('layout', config);
};

exports.createReel = function (request, reply) {

    var createConfig = internals.Reel.createReel(request.payload);
    reply.redirect('/gills/reel/'+ createConfig.id);
};

exports.deleteReel = function (request, reply) {

    internals.Reel.deleteReel(request.params.reelId);
    reply.redirect('/gills/jobs');
};

exports.updateReel = function (request, reply) {

    var updateConfig = internals.Reel.updateReel(request.params.reelId, request.payload);
    reply.redirect('/gills/reel/'+ updateConfig.id);
};
