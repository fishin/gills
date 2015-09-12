var Job = require('./utils/job');
var Reel = require('./utils/reel');
var Run = require('./utils/run');
var User = require('./utils/user');
var Common = require('./utils/common');

var internals = {};

module.exports = internals.Utils = function (options) {

    //console.log('initialize utils');
    options.displayTimeString = exports.displayTimeString;
    this.settings = options;
    var job = new Job(options);
    var reel = new Reel(options);
    var run = new Run(options);
    var user = new User(options);
    var common = new Common(options);
    this.Job = job;
    this.Reel = reel;
    this.Run = run;
    this.User = user;
    this.Common = common;
};

exports.displayTimeString = function (time) {

    if (time < 1000) {
        return time + ' ms';
    } else if (time > 1000 && time < 60 * 1000) {
        return Math.round(time / 1000) + ' s';
    }
    return Math.round(time / (1000 * 60)) + ' m';
};
