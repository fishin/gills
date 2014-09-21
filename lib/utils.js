var Job = require('./utils/job');
var Reel = require('./utils/reel');
var Run = require('./utils/run');

var internals = {};

module.exports = internals.Utils = function(options) {

    this.settings = options;
    var job = new Job(options);
    var reel = new Reel(options);
    var run = new Run(options);
    this.Job = job;
    this.Reel = reel;
    this.Run = run;
};
