var Helper = require('../helper');

var internals = {};

module.exports = internals.Run = function(options) {

   this.settings = options;
   internals.Run.settings = options;
   this.runJob = exports.runJob;
   this.getRunConfig = exports.getRunConfig;
   this.deleteRun = exports.deleteRun;
};

exports.runJob = function (job_id) {

    internals.Run.settings.plugins.tacklebox.startRun(job_id);
};

exports.getRunConfig = function (job_id, run_id) {

    var run = internals.Run.settings.plugins.tacklebox.getRun(run_id);
    var job = internals.Run.settings.plugins.tacklebox.getJob(job_id);
    var commands = [];
    for (var i = 0; i < run.commands.length; i++) {
        //console.log(run.commands[i]);
        var helper = new Helper();
        run.commands[i].finishTime = helper.shortDate(run.commands[i].finishTime);
        run.commands[i].startTime = helper.shortDate(run.commands[i].startTime);
        commands.push(run.commands[i]);
    }
    var commandsArray = run.commands.toString().replace('[','').replace(']','').split(',');
    var shortRunId = run_id.split('-')[0];
    var config = {
       id: job.id,
       name: job.name,
       run_id: run.id,
       short_run_id: shortRunId,
       commands: commands
    };
    config.view_run = true; 
    config.angler = 'lloyd';
    return config;
};

exports.deleteRun = function (job_id, run_id) {

    internals.Run.settings.plugins.tacklebox.deleteRun(job_id, run_id);
};