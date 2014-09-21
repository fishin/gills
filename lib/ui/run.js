var Utils = require('../utils');

var internals = {};

module.exports = internals.Run = function(options) {

   this.settings = options;
   internals.Run.settings = options;
   var utils = new Utils(options);
   internals.Run.getRunConfig = utils.Run.getRunConfig;
   internals.Run.deleteRun = utils.Run.deleteRun;
   internals.Run.runJob = utils.Run.runJob;
   this.runJob = exports.runJob;
   this.getRun = exports.getRun;
   this.deleteRun = exports.deleteRun;
};

exports.runJob = function (request, reply) {

    internals.Run.runJob(request.params.id);
    reply.redirect('/gills/job/' + request.params.id);
};

exports.getRun = function (request, reply) {

    var config = internals.Run.getRunConfig(request.params.id, request.params.run_id);
    reply.view('layout', config);   
};

exports.deleteRun = function (request, reply) {

    internals.Run.deleteRun(request.params.id, request.params.run_id);
    reply.redirect('/gills/job/' + request.params.id );
};
