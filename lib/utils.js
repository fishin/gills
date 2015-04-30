var Job = require('./utils/job');
var Reel = require('./utils/reel');
var Run = require('./utils/run');
var User = require('./utils/user');
var Common = require('./utils/common');

var internals = {};

module.exports = internals.Utils = function (options) {

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
