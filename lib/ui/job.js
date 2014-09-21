var Utils = require('../utils');

var internals = {};

module.exports = internals.Job = function(options) {

   this.settings = options;
   internals.Job.settings = options;
   var utils = new Utils(options);
   internals.Job.createJob = utils.Job.createJob;
   internals.Job.updateJob = utils.Job.updateJob;
   internals.Job.getJobConfig = utils.Job.getJobConfig;
   internals.Job.getJobCreateConfig = utils.Job.getJobCreateConfig;
   internals.Job.getJobsConfig = utils.Job.getJobsConfig;
   internals.Job.deleteJob = utils.Job.deleteJob;
   this.getJobs = exports.getJobs;
   this.getJobView = exports.getJobView;
   this.getJobCreateView = exports.getJobCreateView;
   this.createJob = exports.createJob;
   this.deleteJob = exports.deleteJob;
   this.updateJob = exports.updateJob;
};

exports.getJobs = function (request, reply) {

    var config = internals.Job.getJobsConfig();
    reply.view('layout', config);   
};

exports.createJob = function (request, reply) {

    var config = internals.Job.createJob(request.payload);
    reply.redirect('/gills/job/'+ config.id);
};

exports.getJobView = function (request, reply) {

    var config = internals.Job.getJobConfig(request.params.job_id);
    reply.view('layout', config);   
};

exports.getJobCreateView = function (request, reply) {

    var config = internals.Job.getJobCreateConfig();
    reply.view('layout', config);   
};

exports.updateJob = function (request, reply) {

    var config = internals.Job.updateJob(request.params.job_id, request.payload);
    reply.redirect('/gills/job/'+ request.params.job_id);
};

exports.deleteJob = function (request, reply) {

    internals.Job.deleteJob(request.params.job_id);
    reply.redirect('/gills/jobs');
};
