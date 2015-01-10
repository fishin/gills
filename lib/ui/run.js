var Utils = require('../utils');

var internals = {};

module.exports = internals.Run = function(options) {

   internals.Run.settings = options;
   var utils = new Utils(options);
   internals.Run.getRunConfig = utils.Run.getRunConfig;
   internals.Run.getTestConfig = utils.Run.getTestConfig;
   internals.Run.getCoverageConfig = utils.Run.getCoverageConfig;
   internals.Run.deleteRun = utils.Run.deleteRun;
   internals.Run.startRun = utils.Run.startRun;
   internals.Run.cancelRun = utils.Run.cancelRun;
   this.startRun = exports.startRun;
   this.getRunView = exports.getRunView;
   this.getTestView = exports.getTestView;
   this.getCoverageView = exports.getCoverageView;
   this.deleteRun = exports.deleteRun;
   this.cancelRun = exports.cancelRun;
};

exports.startRun = function (request, reply) {

    internals.Run.startRun(request.params.jobId);
    reply.redirect('/gills/job/' + request.params.jobId);
};

exports.getRunView = function (request, reply) {

    var config = internals.Run.getRunConfig(request.params.jobId, request.params.runId);
    reply.view('layout', config);   
};

exports.getTestView = function (request, reply) {

    var config = internals.Run.getTestConfig(request.params.jobId, request.params.runId, 'lab.json');
    reply.view('layout', config);   
};

exports.getCoverageView = function (request, reply) {

    var config = internals.Run.getCoverageConfig(request.params.jobId, request.params.runId, 'lab.json');
    reply.view('layout', config);   
};

exports.deleteRun = function (request, reply) {

    internals.Run.deleteRun(request.params.jobId, request.params.runId);
    reply.redirect('/gills/job/' + request.params.jobId );
};

exports.cancelRun = function (request, reply) {

    internals.Run.cancelRun(request.params.jobId, request.params.runId);
    reply.redirect('/gills/job/' + request.params.jobId );
};
