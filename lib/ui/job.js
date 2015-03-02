var Utils = require('../utils');

var internals = {};

module.exports = internals.Job = function(options) {

   this.settings = options;
   internals.Job.settings = options;
   var utils = new Utils(options);
   internals.Job.startJob = utils.Job.startJob;
   internals.Job.startPullRequest = utils.Job.startPullRequest;
   internals.Job.createJob = utils.Job.createJob;
   internals.Job.updateJob = utils.Job.updateJob;
   internals.Job.getJobConfig = utils.Job.getJobConfig;
   internals.Job.getJobCreateConfig = utils.Job.getJobCreateConfig;
   internals.Job.getJobsConfig = utils.Job.getJobsConfig;
   internals.Job.deleteJob = utils.Job.deleteJob;
   internals.Job.deleteWorkspace = utils.Job.deleteWorkspace;
   internals.Job.getCommitsConfig = utils.Job.getCommitsConfig;
   internals.Job.mergePullRequest = utils.Job.mergePullRequest;
   internals.Job.retryPullRequest = utils.Job.retryPullRequest;
   this.getJobsView = exports.getJobsView;
   this.getJobView = exports.getJobView;
   this.getCommitsView = exports.getCommitsView;
   this.getJobCreateView = exports.getJobCreateView;
   this.startJob = exports.startJob;
   this.startPullRequest = exports.startPullRequest;
   this.createJob = exports.createJob;
   this.deleteJob = exports.deleteJob;
   this.deleteWorkspace = exports.deleteWorkspace;
   this.updateJob = exports.updateJob;
   this.mergePullRequest = exports.mergePullRequest;
   this.retryPullRequest = exports.retryPullRequest;
};

exports.startJob = function (request, reply) {

    internals.Job.startJob(request.params.jobId);
    reply.redirect(internals.Job.settings.viewPath + '/job/' + request.params.jobId);
};

exports.startPullRequest = function (request, reply) {

    var token = null;
    if (request.auth.credentials) {
        token = request.auth.credentials.token;
    }
    internals.Job.startPullRequest(request.params.jobId, request.params.pr, token, function() {

        return reply.redirect(internals.Job.settings.viewPath + '/job/' + request.params.jobId);
    });
};

exports.getJobsView = function (request, reply) {

    var config = internals.Job.getJobsConfig();
    config.credentials = request.auth.credentials;
    reply.view('layout', config);   
};

exports.createJob = function (request, reply) {

    var config = internals.Job.createJob(request.payload);
    reply.redirect(internals.Job.settings.viewPath + '/job/'+ config.id);
};

exports.getJobView = function (request, reply) {

    var token = null;
    if (request.auth.credentials) {
        token = request.auth.credentials.token;
    }
    internals.Job.getJobConfig(request.params.jobId, token, function(config) {

       config.credentials = request.auth.credentials;
       reply.view('layout', config);   
    });
};

exports.getCommitsView = function (request, reply) {

    var config = internals.Job.getCommitsConfig(request.params.jobId);
    config.credentials = request.auth.credentials;
    reply.view('layout', config);   
};

exports.getJobCreateView = function (request, reply) {

    var config = internals.Job.getJobCreateConfig();
    config.credentials = request.auth.credentials;
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

exports.mergePullRequest = function (request, reply) {

    var token = request.auth.credentials.token;
    internals.Job.mergePullRequest(request.params.jobId, request.params.pr, token, function(result) {

        if (result.error) {
            console.log(result.error);
        }
        reply.redirect(internals.Job.settings.viewPath + '/job/'+ request.params.jobId);
    });
};

exports.retryPullRequest = function (request, reply) {

    internals.Job.retryPullRequest(request.params.jobId, request.params.pr);
    reply.redirect(internals.Job.settings.viewPath + '/job/'+ request.params.jobId);
};
