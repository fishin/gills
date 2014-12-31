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

exports.startRun = function (jobId) {

    var runId = internals.Run.settings.plugins.tacklebox.startRun(jobId);
    return null;
};

exports.getRunConfig = function (jobId, runId) {

    var commonConfig = internals.Run.getCommonConfig();
    //console.log(commonConfig);
    var run = internals.Run.settings.plugins.tacklebox.getRun(jobId, runId);
    var job = internals.Run.settings.plugins.tacklebox.getJob(jobId);
    var commands = [];
    for (var i = 0; i < run.commands.length; i++) {
        //console.log(run.commands[i]);
        var startTime = run.commands[i].startTime;
        //if (run.commands[i].startTime) {
            run.commands[i].startTime = internals.Run.shortDate(startTime);
        //}
        //if (run.commands[i].finishTime) {
            run.commands[i].elapsedTime = run.commands[i].finishTime - startTime;
            run.commands[i].finishTime = internals.Run.shortDate(run.commands[i].finishTime);
        //}
        commands.push(run.commands[i]);
    }
    var commandsArray = run.commands.toString().replace('[','').replace(']','').split(',');
    var shortRunId = runId.split('-')[0];
    var formatStartTime = internals.Run.shortDate(run.startTime);
    var formatFinishTime = null;
    //if (run.finishTime) { 
        formatFinishTime = internals.Run.shortDate(run.finishTime);
    //}
    var config = {
       id: job.id,
       name: job.name,
       startTime: formatStartTime,
       finishTime: formatFinishTime,
       elapsedTime: run.elapsedTime,
       status: run.status,
       runId: run.id,
       short_runId: shortRunId,
       commands: commands
    };
    config.view_run = true; 
    Hoek.merge(config,commonConfig);
    return config;
};

exports.deleteRun = function (jobId, runId) {

    internals.Run.settings.plugins.tacklebox.deleteRun(jobId, runId);
};

exports.cancelRun = function (jobId, runId) {

    internals.Run.settings.plugins.tacklebox.cancelRun(jobId, runId);
};
