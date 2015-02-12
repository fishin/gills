var Utils = require('../utils');

var internals = {};

module.exports = internals.Job = function(options) {

   this.settings = options;
   internals.Job.settings = options;
   var utils = new Utils(options);
   internals.Job.startJob = utils.Job.startJob;
   internals.Job.createJob = utils.Job.createJob;
   internals.Job.updateJob = utils.Job.updateJob;
   internals.Job.getJobConfig = utils.Job.getJobConfig;
   internals.Job.getJobCreateConfig = utils.Job.getJobCreateConfig;
   internals.Job.getJobsConfig = utils.Job.getJobsConfig;
   internals.Job.deleteJob = utils.Job.deleteJob;
   internals.Job.deleteWorkspace = utils.Job.deleteWorkspace;
   internals.Job.getCommitsConfig = utils.Job.getCommitsConfig;
   this.getJobs = exports.getJobs;
   this.getJobView = exports.getJobView;
   this.getCommitsView = exports.getCommitsView;
   this.getJobCreateView = exports.getJobCreateView;
   this.startJob = exports.startJob;
   this.createJob = exports.createJob;
   this.deleteJob = exports.deleteJob;
   this.deleteWorkspace = exports.deleteWorkspace;
   this.updateJob = exports.updateJob;
};

exports.startJob = function (request, reply) {

    internals.Job.startJob(request.params.jobId);
    reply.redirect(internals.Job.settings.viewPath + '/job/' + request.params.jobId);
};

exports.getJobs = function (request, reply) {

    var config = internals.Job.getJobsConfig();
    reply.view('layout', config);   
};

exports.createJob = function (request, reply) {

    var config = internals.Job.createJob(request.payload);
    reply.redirect(internals.Job.settings.viewPath + '/job/'+ config.id);
};

exports.getJobView = function (request, reply) {

    internals.Job.getJobConfig(request.params.jobId, function(config) {

       reply.view('layout', config);   
    });
};

exports.getCommitsView = function (request, reply) {

    var config = internals.Job.getCommitsConfig(request.params.jobId);
    reply.view('layout', config);   
};

exports.getJobCreateView = function (request, reply) {

    var config = internals.Job.getJobCreateConfig();
    reply.view('layout', config);   
};

exports.updateJob = function (request, reply) {

    var config = internals.Job.updateJob(request.params.jobId, request.payload);
    reply.redirect(internals.Job.settings.viewPath + '/job/'+ request.params.jobId);
};

exports.deleteJob = function (request, reply) {

    internals.Job.deleteJob(request.params.jobId);
    reply.redirect(internals.Job.settings.viewPath + '/jobs');
};

exports.deleteWorkspace = function (request, reply) {

    internals.Job.deleteWorkspace(request.params.jobId);
    reply.redirect(internals.Job.settings.viewPath + '/job/'+ request.params.jobId);
};
