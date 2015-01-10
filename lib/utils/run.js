var Common = require('./common');
var Hoek = require('hoek');

var internals = {};

module.exports = internals.Run = function(options) {

   internals.Run.settings = options;
   var common = new Common(options);
   internals.Run.getCommonConfig = common.getCommonConfig;
   internals.Run.shortDate = common.shortDate;
   this.startRun = exports.startRun;
   this.getRunConfig = exports.getRunConfig;
   this.getTestConfig = exports.getTestConfig;
   this.getCoverageConfig = exports.getCoverageConfig;
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

exports.getTestConfig = function (jobId, runId, artifact) {

    var commonConfig = internals.Run.getCommonConfig();
    //console.log(commonConfig);
    var run = internals.Run.settings.plugins.tacklebox.getRun(jobId, runId);
    var job = internals.Run.settings.plugins.tacklebox.getJob(jobId);
    var contents = internals.Run.settings.plugins.tacklebox.getWorkspaceArtifact(jobId, artifact);
    var result = {};
    if (contents) {
        var tests = JSON.parse(contents);
        result.totalTests = 0;
        result.totalDuration = tests.duration;
        result.totalLeaks = tests.leaks.length;
        result.tests = tests.tests;
        for (key in result.tests) {
            // add counter for each test
            for (var i = 0; i < tests.tests[key].length; i++) {
                result.totalTests++;
                result.tests[key][i].testNum = result.totalTests;
            }
        }
        //console.log('totalTests: ' + result.totalTests);
        console.log(JSON.stringify(tests, null, 4));
    } else {
        result = null;
    }
    var config = {
       jobId: job.id,
       runId: run.id,
       jobName: job.name,
       elapsedTime: run.elapsedTime,
       status: run.status,
       testResults: result
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
    var contents = internals.Run.settings.plugins.tacklebox.getWorkspaceArtifact(jobId, artifact);
    var result = {};
    if (contents) {
        var tests = JSON.parse(contents);
        result.coveragePercent = Math.round(tests.coverage.percent * 100) / 100;
        result.coverage = tests.coverage;
    } else {
        result = null;
    }
    var config = {
       jobId: job.id,
       runId: run.id,
       jobName: job.name,
       testResults: result
    };
    config.view_coverage = true; 
    Hoek.merge(config,commonConfig);
    return config;
};

exports.deleteRun = function (jobId, runId) {

    internals.Run.settings.plugins.tacklebox.deleteRun(jobId, runId);
};

exports.cancelRun = function (jobId, runId) {

    internals.Run.settings.plugins.tacklebox.cancelRun(jobId, runId);
};
