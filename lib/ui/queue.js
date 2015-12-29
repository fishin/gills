'use strict';

const Hoek = require('hoek');
const Wreck = require('wreck');

const internals = {};

module.exports = internals.Queue = function (options) {

    this.settings = options;
    internals.Queue.settings = options;
    this.addJob = exports.addJob;
    this.removeJob = exports.removeJob;
    this.clearQueue = exports.clearQueue;
    this.removePullRequest = exports.removePullRequest;
};

exports.addJob = function (request, reply) {

    const payload = {
        jobId: request.params.jobId
    };
    Wreck.post(internals.Queue.settings.api.url + '/queue', { payload: JSON.stringify(payload) }, (err, resp, pl) => {

        Hoek.assert(!err, err);
        return reply.redirect(request.headers.referer || '/');
    });
};

exports.removeJob = function (request, reply) {

    Wreck.delete(internals.Queue.settings.api.url + '/queue/' + request.params.jobId, (err, resp, pl) => {

        Hoek.assert(!err, err);
        return reply.redirect(request.headers.referer || '/');
    });
};

exports.clearQueue = function (request, reply) {

    Wreck.delete(internals.Queue.settings.api.url + '/queue', (err, resp, pl) => {

        Hoek.assert(!err, err);
        return reply.redirect(request.headers.referer || '/');
    });
};

exports.removePullRequest = function (request, reply) {

    Wreck.delete(internals.Queue.settings.api.url + '/queue/' + request.params.jobId + '/pr/' + request.params.pr, (err, resp, pl) => {

        Hoek.assert(!err, err);
        return reply.redirect(request.headers.referer || '/');
    });
};
