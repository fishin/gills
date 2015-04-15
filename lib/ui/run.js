var Utils = require('../utils');

var internals = {};

module.exports = internals.Run = function(options) {

   internals.Run.settings = options;
   var utils = new Utils(options);
   internals.Run.getRunConfig = utils.Run.getRunConfig;
   internals.Run.getPullRequestRunConfig = utils.Run.getPullRequestRunConfig;
   internals.Run.getTestConfig = utils.Run.getTestConfig;
   internals.Run.getCoverageConfig = utils.Run.getCoverageConfig;
   internals.Run.getFileConfig = utils.Run.getFileConfig;
   internals.Run.deleteRun = utils.Run.deleteRun;
   internals.Run.cancelRun = utils.Run.cancelRun;
   internals.Run.cancelPullRequest = utils.Run.cancelPullRequest;
   this.startRun = exports.startRun;
   this.getRunView = exports.getRunView;
   this.getPullRequestRunView = exports.getPullRequestRunView;
   this.getFileView = exports.getFileView;
   this.getTestView = exports.getTestView;
   this.getCoverageView = exports.getCoverageView;
   this.deleteRun = exports.deleteRun;
   this.cancelRun = exports.cancelRun;
   this.cancelPullRequest = exports.cancelPullRequest;
};

exports.getRunView = function (request, reply) {

    internals.Run.getRunConfig(request.params.jobId, request.params.runId, function(config) {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getPullRequestRunView = function (request, reply) {

    var token = null;
    if (request.auth.credentials) {
        token = request.auth.credentials.token;
    }
    internals.Run.getPullRequestRunConfig(request.params.jobId, request.params.pr, token, request.params.runId, function(config) {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getFileView = function (request, reply) {

    internals.Run.getFileConfig(request.params.jobId, request.params.runId, request.params.file, function (config) {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getTestView = function (request, reply) {

    internals.Run.getTestConfig(request.params.jobId, request.params.runId, 'lab.json', function (config) {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getCoverageView = function (request, reply) {

    internals.Run.getCoverageConfig(request.params.jobId, request.params.runId, 'lab.json', function (config) {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.deleteRun = function (request, reply) {

    internals.Run.deleteRun(request.params.jobId, request.params.runId, function() {

        return reply.redirect(internals.Run.settings.viewPath + '/job/' + request.params.jobId );
    });
};

exports.cancelRun = function (request, reply) {

    internals.Run.cancelRun(request.params.jobId, request.params.runId, function() {

        return reply.redirect(internals.Run.settings.viewPath + '/job/' + request.params.jobId);
    });
};

exports.cancelPullRequest = function (request, reply) {

    var token = null;
    if (request.auth.credentials) {
        token = request.auth.credentials.token;
    }
    internals.Run.cancelPullRequest(request.params.jobId, request.params.pr, token, request.params.runId, function() {

        return reply.redirect(internals.Run.settings.viewPath + '/job/' + request.params.jobId);
    });
};
