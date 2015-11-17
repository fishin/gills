'use strict';

const internals = {};

module.exports = internals.Job = function (options) {

    this.settings = options;
    internals.Job.settings = options;
    internals.Job.startPullRequest = options.Utils.Job.startPullRequest;
    internals.Job.createJob = options.Utils.Job.createJob;
    internals.Job.updateJob = options.Utils.Job.updateJob;
    internals.Job.getJobConfig = options.Utils.Job.getJobConfig;
    internals.Job.getJobCreateConfig = options.Utils.Job.getJobCreateConfig;
    internals.Job.getJobsConfig = options.Utils.Job.getJobsConfig;
    internals.Job.deleteJob = options.Utils.Job.deleteJob;
    internals.Job.deleteWorkspace = options.Utils.Job.deleteWorkspace;
    internals.Job.getCommitsConfig = options.Utils.Job.getCommitsConfig;
    internals.Job.mergePullRequest = options.Utils.Job.mergePullRequest;
    internals.Job.retryPullRequest = options.Utils.Job.retryPullRequest;
    this.getJobsView = exports.getJobsView;
    this.getJobView = exports.getJobView;
    this.getCommitsView = exports.getCommitsView;
    this.getJobCreateView = exports.getJobCreateView;
    this.startPullRequest = exports.startPullRequest;
    this.createJob = exports.createJob;
    this.deleteJob = exports.deleteJob;
    this.deleteWorkspace = exports.deleteWorkspace;
    this.updateJob = exports.updateJob;
    this.mergePullRequest = exports.mergePullRequest;
    this.retryPullRequest = exports.retryPullRequest;
};

exports.startPullRequest = function (request, reply) {

    internals.Job.startPullRequest(request.params.jobId, request.params.pr, () => {

        return reply.redirect(internals.Job.settings.viewPath + '/job/' + request.params.jobId);
    });
};

exports.getJobsView = function (request, reply) {

    internals.Job.getJobsConfig((config) => {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.createJob = function (request, reply) {

    internals.Job.createJob(request.payload, (config) => {

        //console.log(config.id);
        return reply.redirect(internals.Job.settings.viewPath + '/job/' + config.id);
    });
};

exports.getJobView = function (request, reply) {

    internals.Job.getJobConfig(request.params.jobId, (config) => {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getCommitsView = function (request, reply) {

    internals.Job.getCommitsConfig(request.params.jobId, (config) => {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getJobCreateView = function (request, reply) {

    internals.Job.getJobCreateConfig((config) => {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.updateJob = function (request, reply) {

    internals.Job.updateJob(request.params.jobId, request.payload, () => {

        return reply.redirect(internals.Job.settings.viewPath + '/job/' + request.params.jobId);
    });
};

exports.deleteJob = function (request, reply) {

    internals.Job.deleteJob(request.params.jobId, () => {

        return reply.redirect(internals.Job.settings.viewPath + '/jobs');
    });
};

exports.deleteWorkspace = function (request, reply) {

    internals.Job.deleteWorkspace(request.params.jobId, () => {

        return reply.redirect(internals.Job.settings.viewPath + '/job/' + request.params.jobId);
    });
};

exports.mergePullRequest = function (request, reply) {

    let token = null;
    if (request.auth.credentials) {
        token = request.auth.credentials.token;
    }
    internals.Job.mergePullRequest(request.params.jobId, request.params.pr, token, (result) => {

        if (result.error) {
            console.log(result.error);
        }
        return reply.redirect(internals.Job.settings.viewPath + '/job/' + request.params.jobId);
    });
};

exports.retryPullRequest = function (request, reply) {

    internals.Job.retryPullRequest(request.params.jobId, request.params.pr, () => {

        return reply.redirect(internals.Job.settings.viewPath + '/job/' + request.params.jobId);
    });
};
