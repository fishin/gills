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
   this.createReel = exports.createReel;
   this.updateReel = exports.updateReel;
   this.deleteReel = exports.deleteReel;
   this.getReel = exports.getReel;
};

exports.getReel = function (request, reply) {

    var config = internals.Reel.getReelConfig(request.params.reel_id);
    reply.view('layout', config);   
};

exports.createReel = function (request, reply) {

    var createConfig = internals.Reel.createReel(request.payload);
    reply.redirect('/gills/reel/'+ createConfig.id);
};

exports.deleteReel = function (request, reply) {

    internals.Reel.deleteReel(request.params.reel_id);
    reply.redirect('/gills/jobs');
};

exports.updateReel = function (request, reply) {

    var updateConfig = internals.Reel.updateReel(request.params.reel_id, request.payload);
    reply.redirect('/gills/reel/'+ updateConfig.id);
};
