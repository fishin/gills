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
   this.getRunView = exports.getRunView;
   this.deleteRun = exports.deleteRun;
};

exports.runJob = function (request, reply) {

    internals.Run.runJob(request.params.job_id);
    reply.redirect('/gills/job/' + request.params.job_id);
};

exports.getRunView = function (request, reply) {

    var config = internals.Run.getRunConfig(request.params.job_id, request.params.run_id);
    reply.view('layout', config);   
};

exports.deleteRun = function (request, reply) {

    internals.Run.deleteRun(request.params.job_id, request.params.run_id);
    reply.redirect('/gills/job/' + request.params.job_id );
};
