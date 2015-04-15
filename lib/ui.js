var Utils = require('./utils');
var Job = require('./ui/job');
var Run = require('./ui/run');
var Reel = require('./ui/reel');
var User = require('./ui/user');
var Queue = require('./ui/queue');

var internals = {};

module.exports = internals.Ui = function(options) {

   internals.Ui.settings = options;
   var job = new Job(options);
   var run = new Run(options);
   var reel = new Reel(options);
   var user = new User(options);
   var queue = new Queue(options);
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
