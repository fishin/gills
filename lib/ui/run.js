'use strict';

const internals = {};

module.exports = internals.Run = function (options) {

    internals.Run.settings = options;
    internals.Run.getRunConfig = options.Utils.Run.getRunConfig;
    internals.Run.getPullRequestRunConfig = options.Utils.Run.getPullRequestRunConfig;
    internals.Run.getTestConfig = options.Utils.Run.getTestConfig;
    internals.Run.getCoverageConfig = options.Utils.Run.getCoverageConfig;
    internals.Run.getFileConfig = options.Utils.Run.getFileConfig;
    internals.Run.deleteRun = options.Utils.Run.deleteRun;
    internals.Run.deleteRuns = options.Utils.Run.deleteRuns;
    internals.Run.cancelRun = options.Utils.Run.cancelRun;
    internals.Run.cancelPullRequest = options.Utils.Run.cancelPullRequest;
    this.startRun = exports.startRun;
    this.getRunView = exports.getRunView;
    this.getPullRequestRunView = exports.getPullRequestRunView;
    this.getFileView = exports.getFileView;
    this.getTestView = exports.getTestView;
    this.getCoverageView = exports.getCoverageView;
    this.deleteRun = exports.deleteRun;
    this.deleteRuns = exports.deleteRuns;
    this.cancelRun = exports.cancelRun;
    this.cancelPullRequest = exports.cancelPullRequest;
};

exports.getRunView = function (request, reply) {

    internals.Run.getRunConfig(request.params.jobId, request.params.runId, (config) => {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getPullRequestRunView = function (request, reply) {

    internals.Run.getPullRequestRunConfig(request.params.jobId, request.params.pr, request.params.runId, (config) => {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getFileView = function (request, reply) {

    internals.Run.getFileConfig(request.params.jobId, request.params.runId, request.params.file, (config) => {

        config.credentials = request.auth.credentials;
        if (request.params.file.match('.html')) {
            return reply(config.contents).type('text/html');
        }
        return reply.view('layout', config);
    });
};

exports.getTestView = function (request, reply) {

    internals.Run.getTestConfig(request.params.jobId, request.params.runId, (config) => {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getCoverageView = function (request, reply) {

    internals.Run.getCoverageConfig(request.params.jobId, request.params.runId, (config) => {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.deleteRun = function (request, reply) {

    internals.Run.deleteRun(request.params.jobId, request.params.runId, () => {

        return reply.redirect(internals.Run.settings.viewPath + '/job/' + request.params.jobId );
    });
};

exports.deleteRuns = function (request, reply) {

    internals.Run.deleteRuns(request.params.jobId, () => {

        return reply.redirect(internals.Run.settings.viewPath + '/job/' + request.params.jobId );
    });
};

exports.cancelRun = function (request, reply) {

    internals.Run.cancelRun(request.params.jobId, request.params.runId, () => {

        return reply.redirect(request.headers.referer || '/');
    });
};

exports.cancelPullRequest = function (request, reply) {

    internals.Run.cancelPullRequest(request.params.jobId, request.params.pr, request.params.runId, () => {

        return reply.redirect(request.headers.referer || '/');
    });
};
