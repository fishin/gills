var Wreck = require('wreck');

var internals = {};

module.exports = internals.Queue = function (options) {

    this.settings = options;
    internals.Queue.settings = options;
    this.addJob = exports.addJob;
    this.removeJob = exports.removeJob;
};

exports.addJob = function (request, reply) {

    var payload = {
        jobId: request.params.jobId
    };
    Wreck.post(internals.Queue.settings.api.url + '/queue', { payload: JSON.stringify(payload) }, function (err, resp, pl) {

        return reply.redirect(internals.Queue.settings.viewPath + '/job/' + request.params.jobId);
    });
};

exports.removeJob = function (request, reply) {

    Wreck.delete(internals.Queue.settings.api.url + '/queue/' + request.params.jobId, function (err, resp, pl) {

        return reply.redirect(internals.Queue.settings.viewPath + '/job/' + request.params.jobId);
    });
};
