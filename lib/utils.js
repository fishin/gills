'use strict';

const Job = require('./utils/job');
const Reel = require('./utils/reel');
const Run = require('./utils/run');
const User = require('./utils/user');
const Common = require('./utils/common');

const internals = {};

module.exports = internals.Utils = function (options) {

    //console.log('initialize utils');
    options.displayTimeString = exports.displayTimeString;
    this.settings = options;
    const job = new Job(options);
    const reel = new Reel(options);
    const run = new Run(options);
    const user = new User(options);
    const common = new Common(options);
    this.Job = job;
    this.Reel = reel;
    this.Run = run;
    this.User = user;
    this.Common = common;
};

exports.displayTimeString = function (time) {

    if (time < 1000) {
        // get 2 decimals
        return Math.round(time * 100) / 100 + ' ms';
    }
    else if (time > 1000 && time < 60 * 1000) {
        return Math.round(time / 1000 * 100) / 100 + ' s';
    }
    return Math.round(time / (1000 * 60) * 100) / 100 + ' m';
};
