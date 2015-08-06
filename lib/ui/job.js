var Utils = require('../utils');

var internals = {};

module.exports = internals.Job = function (options) {

    this.settings = options;
    internals.Job.settings = options;
    var utils = new Utils(options);
//    internals.Job.startJob = utils.Job.startJob;
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

/*
exports.startJob = function (request, reply) {

    internals.Job.startJob(request.params.jobId, function () {

        return reply.redirect(internals.Job.settings.viewPath + '/job/' + request.params.jobId);
    });
};
*/

exports.startPullRequest = function (request, reply) {

    internals.Job.startPullRequest(request.params.jobId, request.params.pr, function () {

        return reply.redirect(internals.Job.settings.viewPath + '/job/' + request.params.jobId);
    });
};

exports.getJobsView = function (request, reply) {

    internals.Job.getJobsConfig(function (config) {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.createJob = function (request, reply) {

    internals.Job.createJob(request.payload, function (config) {

        //console.log(config.id);
        return reply.redirect(internals.Job.settings.viewPath + '/job/' + config.id);
    });
};

exports.getJobView = function (request, reply) {

    internals.Job.getJobConfig(request.params.jobId, function (config) {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getCommitsView = function (request, reply) {

    internals.Job.getCommitsConfig(request.params.jobId, function (config) {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getJobCreateView = function (request, reply) {

    internals.Job.getJobCreateConfig(function (config) {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.updateJob = function (request, reply) {

    internals.Job.updateJob(request.params.jobId, request.payload, function () {

        return reply.redirect(internals.Job.settings.viewPath + '/job/' + request.params.jobId);
    });
};

exports.deleteJob = function (request, reply) {

    internals.Job.deleteJob(request.params.jobId, function () {

        return reply.redirect(internals.Job.settings.viewPath + '/jobs');
    });
};

exports.deleteWorkspace = function (request, reply) {

    internals.Job.deleteWorkspace(request.params.jobId, function () {

        return reply.redirect(internals.Job.settings.viewPath + '/job/' + request.params.jobId);
    });
};

exports.mergePullRequest = function (request, reply) {

    var token = null;
    if (request.auth.credentials) {
        token = request.auth.credentials.token;
    }
    internals.Job.mergePullRequest(request.params.jobId, request.params.pr, token, function (result) {

        if (result.error) {
            console.log(result.error);
        }
        return reply.redirect(internals.Job.settings.viewPath + '/job/' + request.params.jobId);
    });
};

exports.retryPullRequest = function (request, reply) {

    internals.Job.retryPullRequest(request.params.jobId, request.params.pr, function () {

        return reply.redirect(internals.Job.settings.viewPath + '/job/' + request.params.jobId);
    });
};
