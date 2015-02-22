var DateFormat = require('dateformat');
var Hoek = require('hoek');
var Common = require('./common');

var internals = {};

module.exports = internals.Run = function(options) {

   internals.Run.settings = options;
   var common = new Common(options);
   internals.Run.getCommonConfig = common.getCommonConfig;
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
    var run = internals.Run.settings.plugins.tacklebox.getRun(jobId, null, runId);
    var runs = internals.Run.settings.plugins.tacklebox.getRuns(jobId, null);
    var job = internals.Run.settings.plugins.tacklebox.getJob(jobId);
    var testResult = internals.Run.settings.plugins.tacklebox.getTestResult(jobId, runId, 'lab.json');

    var compareCommits;
    for (var i = 0; i < runs.length; i++) {
        // figure out which runIndex it is
        if (runs[i].id === runId) {
            // get the prev run if its not the first one
            if (i !== runs.length-1) {
                compareCommits = internals.Run.settings.plugins.tacklebox.getCompareCommits(jobId, runs[i].commit, runs[i+1].commit);
            }      
        }
    }

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
            run.commands[i].startTime = DateFormat(startTime, 'yyyy-mm-dd HH:MM:ss');
        }
        if (run.commands[i].finishTime) {
            run.commands[i].elapsedTime = run.commands[i].finishTime - startTime;
            run.commands[i].finishTime = DateFormat(run.commands[i].finishTime, 'yyyy-mm-dd HH:MM:ss');
        }
        commands.push(run.commands[i]);
    }
    var commandsArray = run.commands.toString().replace('[','').replace(']','').split(',');
    var shortRunId = runId.split('-')[0];
    var formatStartTime = DateFormat(run.startTime, 'yyyy-mm-dd HH:MM:ss');
    var formatFinishTime = null;
    if (run.finishTime) { 
        formatFinishTime = DateFormat(run.finishTime, 'yyyy-mm-dd HH:MM:ss');
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
       testResult: testResult,
       compareCommits: compareCommits,
       checkout: run.checkout
    };
    config.view_run = true; 
    Hoek.merge(config,commonConfig);
    return config;
};

exports.getTestConfig = function (jobId, runId, artifact) {

    var commonConfig = internals.Run.getCommonConfig();
    //console.log(commonConfig);
    var run = internals.Run.settings.plugins.tacklebox.getRun(jobId, null, runId);
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
    var run = internals.Run.settings.plugins.tacklebox.getRun(jobId, null, runId);
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

    internals.Run.settings.plugins.tacklebox.deleteRun(jobId, null, runId);
};

exports.cancelRun = function (jobId, runId) {

    internals.Run.settings.plugins.tacklebox.cancelRun(jobId, null, runId);
};
