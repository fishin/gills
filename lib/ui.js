var Utils = require('./utils');
var Job = require('./ui/job');
var Run = require('./ui/run');
var Reel = require('./ui/reel');
var User = require('./ui/user');

var internals = {};

module.exports = internals.Ui = function(options) {

   this.settings = options;
   internals.Ui.settings = options;
   var job = new Job(options);
   var run = new Run(options);
   var reel = new Reel(options);
   var user = new User(options);
   this.Job = job;
   this.Run = run;
   this.Reel = reel;
   this.User = user;
   this.redirectHome = exports.redirectHome;
};

exports.redirectHome = function (request, reply) {

    reply.redirect('/gills/jobs');
};
