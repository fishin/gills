var Common = require('./common');
var Hoek = require('hoek');

var internals = {};

module.exports = internals.Run = function(options) {

   internals.Run.settings = options;
   var common = new Common(options);
   internals.Run.getCommonConfig = common.getCommonConfig;
   internals.Run.shortDate = common.shortDate;
   this.getRunConfig = exports.getRunConfig;
   this.getFileConfig = exports.getFileConfig;
   this.getTestConfig = exports.getTestConfig;
   this.getCoverageConfig = exports.getCoverageConfig;
   this.deleteRun = exports.deleteRun;
   this.cancelRun = exports.cancelRun;
};

exports.getRunConfig = function (jobId, runId) {

    var commonConfig = internals.Run.getCommonConfig();
    //console.log(commonConfig);
    var run = internals.Run.settings.plugins.tacklebox.getRun(jobId, runId);
    var job = internals.Run.settings.plugins.tacklebox.getJob(jobId);
    var testResult = internals.Run.settings.plugins.tacklebox.getTestResult(jobId, runId, 'lab.json');

    var archiveFiles = [];
    var files = internals.Run.settings.plugins.tacklebox.getArchiveArtifacts(jobId, runId);
    for (var i = 0; i < files.length; i++) {
        var config = {
            jobId: jobId,
            runId: runId,
            file: files[i]
        };
        archiveFiles.push(config);  
    }
    var commands = [];
    for (var i = 0; i < run.commands.length; i++) {
        //console.log(run.commands[i]);
        var startTime = run.commands[i].startTime;
        if (run.commands[i].startTime) {
            run.commands[i].startTime = internals.Run.shortDate(startTime);
        }
        if (run.commands[i].finishTime) {
            run.commands[i].elapsedTime = run.commands[i].finishTime - startTime;
            run.commands[i].finishTime = internals.Run.shortDate(run.commands[i].finishTime);
        }
        commands.push(run.commands[i]);
    }
    var commandsArray = run.commands.toString().replace('[','').replace(']','').split(',');
    var shortRunId = runId.split('-')[0];
    var formatStartTime = internals.Run.shortDate(run.startTime);
    var formatFinishTime = null;
    if (run.finishTime) { 
        formatFinishTime = internals.Run.shortDate(run.finishTime);
    }
    var config = {
       jobId: job.id,
       name: job.name,
       startTime: formatStartTime,
       finishTime: formatFinishTime,
       elapsedTime: run.elapsedTime,
       status: run.status,
       commit: run.commit,
       runId: run.id,
       short_runId: shortRunId,
       commands: commands,
       archiveFiles: archiveFiles,
       testResult: testResult
    };
    config.view_run = true; 
    Hoek.merge(config,commonConfig);
    return config;
};

exports.getTestConfig = function (jobId, runId, artifact) {

    var commonConfig = internals.Run.getCommonConfig();
    //console.log(commonConfig);
    var run = internals.Run.settings.plugins.tacklebox.getRun(jobId, runId);
    var job = internals.Run.settings.plugins.tacklebox.getJob(jobId);
    var testResult = internals.Run.settings.plugins.tacklebox.getTestResult(jobId, runId, 'lab.json');
    var config = {
       jobId: job.id,
       runId: run.id,
       jobName: job.name,
       elapsedTime: run.elapsedTime,
       status: run.status,
       testResult: testResult
    };
    config.view_test = true; 
    Hoek.merge(config,commonConfig);
    return config;
};

exports.getCoverageConfig = function (jobId, runId, artifact) {

    var commonConfig = internals.Run.getCommonConfig();
    //console.log(commonConfig);
    var run = internals.Run.settings.plugins.tacklebox.getRun(jobId, runId);
    var job = internals.Run.settings.plugins.tacklebox.getJob(jobId);
    var testResult = internals.Run.settings.plugins.tacklebox.getTestResult(jobId, runId, 'lab.json');
    var config = {
       jobId: job.id,
       runId: run.id,
       jobName: job.name,
       testResult: testResult
    };
    config.view_coverage = true; 
    Hoek.merge(config,commonConfig);
    return config;
};

exports.getFileConfig = function (jobId, runId, file) {

    var commonConfig = internals.Run.getCommonConfig();
    var contents = internals.Run.settings.plugins.tacklebox.getArchiveArtifact(jobId, runId, file);
    //if (file.match('.json')) {
    //   contents = JSON.stringify(contents, null, 4);
    //   contents.replace(/\r\n/g,'<br/><br/>');
    //}
    var config = {
       jobId: jobId,
       runId: runId,
       file: file,
       contents: contents
    };
    config.view_file = true; 
    Hoek.merge(config,commonConfig);
    return config;
};

exports.deleteRun = function (jobId, runId) {

    internals.Run.settings.plugins.tacklebox.deleteRun(jobId, runId);
};

exports.cancelRun = function (jobId, runId) {

    internals.Run.settings.plugins.tacklebox.cancelRun(jobId, runId);
};
