'use strict';

const Job = require('./ui/job');
const Run = require('./ui/run');
const Reel = require('./ui/reel');
const User = require('./ui/user');
const Queue = require('./ui/queue');

const internals = {};

module.exports = internals.Ui = function (options) {

    internals.Ui.settings = options;
    const job = new Job(options);
    const run = new Run(options);
    const reel = new Reel(options);
    const user = new User(options);
    const queue = new Queue(options);
    this.Job = job;
    this.Run = run;
    this.Reel = reel;
    this.User = user;
    this.Queue = queue;
    this.redirectHome = exports.redirectHome;
};

exports.redirectHome = function (request, reply) {

    return reply.redirect(internals.Ui.settings.viewPath + '/jobs');
};
