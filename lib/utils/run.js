var Common = require('./common');
var Hoek = require('hoek');

var internals = {};

module.exports = internals.Run = function(options) {

   this.settings = options;
   internals.Run.settings = options;
   var common = new Common(options);
   internals.Run.getCommonConfig = common.getCommonConfig;
   internals.Run.shortDate = common.shortDate;
   this.startRun = exports.startRun;
   this.getRunConfig = exports.getRunConfig;
   this.deleteRun = exports.deleteRun;
   this.cancelRun = exports.cancelRun;
};

exports.startRun = function (job_id) {

    var run_id = internals.Run.settings.plugins.tacklebox.startRun(job_id);
    return null;
};

exports.getRunConfig = function (job_id, run_id) {

    var commonConfig = internals.Run.getCommonConfig();
    //console.log(commonConfig);
    var run = internals.Run.settings.plugins.tacklebox.getRun(job_id, run_id);
    var job = internals.Run.settings.plugins.tacklebox.getJob(job_id);
    var commands = [];
    for (var i = 0; i < run.commands.length; i++) {
        //console.log(run.commands[i]);
        run.commands[i].elapsedTime = run.commands[i].finishTime - run.commands[i].startTime;
        run.commands[i].finishTime = internals.Run.shortDate(run.commands[i].finishTime);
        run.commands[i].startTime = internals.Run.shortDate(run.commands[i].startTime);
        commands.push(run.commands[i]);
    }
    var commandsArray = run.commands.toString().replace('[','').replace(']','').split(',');
    var shortRunId = run_id.split('-')[0];
    var formatStartTime = internals.Run.shortDate(run.startTime);
    var formatFinishTime = internals.Run.shortDate(run.finishTime);
    var config = {
       id: job.id,
       name: job.name,
       startTime: formatStartTime,
       finishTime: formatFinishTime,
       elapsedTime: run.elapsedTime,
       status: run.status,
       run_id: run.id,
       short_run_id: shortRunId,
       commands: commands
    };
    config.view_run = true; 
    Hoek.merge(config,commonConfig);
    return config;
};

exports.deleteRun = function (job_id, run_id) {

    internals.Run.settings.plugins.tacklebox.deleteRun(job_id, run_id);
};

exports.cancelRun = function (job_id, run_id) {

    internals.Run.settings.plugins.tacklebox.cancelRun(job_id, run_id);
};
