var Utils = require('../utils');

var internals = {};

module.exports = internals.Queue = function(options) {

   this.settings = options;
   internals.Queue.settings = options;
   var utils = new Utils(options);
   internals.Queue.addJob = utils.Queue.addJob;
   internals.Queue.removeJob = utils.Queue.removeJob;
   this.addJob = exports.addJob;
   this.removeJob = exports.removeJob;
};

exports.addJob = function (request, reply) {

    internals.Queue.addJob(request.params.jobId);
    reply.redirect('/gills/job/' + request.params.jobId);
};

exports.removeJob = function (request, reply) {

    internals.Queue.removeJob(request.params.jobId);
    reply.redirect('/gills/job/' + request.params.jobId);
};
