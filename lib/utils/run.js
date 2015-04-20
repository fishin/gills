var Bait = require('bait');
var DateFormat = require('dateformat');
var Hoek = require('hoek');
var Wreck = require('wreck');
var Common = require('./common');

var internals = {};

module.exports = internals.Run = function(options) {

   internals.Run.settings = options;
   var common = new Common(options);
   internals.Run.getCommonConfig = common.getCommonConfig;
   this.getRunConfig = exports.getRunConfig;
   this.getPullRequestRunConfig = exports.getPullRequestRunConfig;
   this.getFileConfig = exports.getFileConfig;
   this.getTestConfig = exports.getTestConfig;
   this.getCoverageConfig = exports.getCoverageConfig;
   this.deleteRun = exports.deleteRun;
   this.cancelRun = exports.cancelRun;
   this.cancelPullRequest = exports.cancelPullRequest;
};

exports.getRunConfig = function (jobId, runId, cb) {

    var config = {
        view_run: true,
        jobId: jobId
    };
    internals.Run.getCommonConfig(function (commonConfig) {

        //console.log(commonConfig);
        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId, function (err, resp, pl) {

            var job = JSON.parse(pl);
            config.name = job.name;
            Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId, function (err, resp, pl) {

                var run = JSON.parse(pl);
                config.runId = run.id;
                config.status = run.status;
                config.commit = run.commit;
                config.checkout = run.checkout;
                config.short_runId = run.id.split('-')[0];
                Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/runs', function (err, resp, pl) {

                    var runs = JSON.parse(pl);
                    Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + run.id + '/test/lab.json', function(err, resp, pl) {

                        if (pl) {
                            config.testResult = JSON.parse(pl);
                        }
                        for (var i = 0; i < runs.length; i++) {
                            // figure out which runIndex it is
                            if (runs[i].id === runId) {
                            // get the prev run if its not the first one
                                if (i !== runs.length - 1) {
                                    //config.compareCommits = internals.Run.settings.plugins.tacklebox.getCompareCommits(jobId, runs[i].commit, runs[i + 1].commit);
                                    var bait = new Bait(internals.Run.settings.job); 
                                    //config.compareCommits = bait.getCompareCommits(jobId, runs[i].commit, runs[i + 1].commit);
                                }
                            }
                        }
                        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId + '/archive', function (err, resp, pl) {

                            var files = JSON.parse(pl);
                            config.archiveFiles = [];
                            for (var i = 0; i < files.length; i++) {
                                var fileConfig = {
                                    jobId: jobId,
                                    runId: runId,
                                    file: files[i]
                                };
                                config.archiveFiles.push(fileConfig);
                            }
                            config.commands = [];
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
                                config.commands.push(run.commands[i]);
                            }
                            var commandsArray = run.commands.toString().replace('[', '').replace(']', '').split(',');
                            config.startTime = DateFormat(run.startTime, 'yyyy-mm-dd HH:MM:ss');
                            if (run.finishTime) {
                                config.finishTime = DateFormat(run.finishTime, 'yyyy-mm-dd HH:MM:ss');
                                config.elapsedTime = run.finishTime - run.startTime;
                            }
                            Hoek.merge(config, commonConfig);
                            return cb(config);
                        }); 
                    }); 
                }); 
            }); 
        }); 
    });
};

exports.getPullRequestRunConfig = function (jobId, number, token, runId, cb) {

    var bait = new Bait(internals.Run.settings.job); 
    //internals.Run.settings.plugins.tacklebox.getPullRequest(jobId, number, token, function(pr) {
    Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/pr/' + number, function (err, resp, pl) {

        var pr = JSON.parse(pl);
        var commonConfig = internals.Run.getCommonConfig();
        //console.log(commonConfig);
        //var run = internals.Run.settings.plugins.tacklebox.getRun(jobId, pr, runId);
        var run = bait.getRun(jobId, pr, runId);
        //var job = internals.Run.settings.plugins.tacklebox.getJob(jobId);
        var job = bait.getJob(jobId);
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
        var commandsArray = run.commands.toString().replace('[', '').replace(']', '').split(',');
        var shortRunId = runId.split('-')[0];
        var formatStartTime = DateFormat(run.startTime, 'yyyy-mm-dd HH:MM:ss');
        var formatFinishTime = null;
        if (run.finishTime) {
            formatFinishTime = DateFormat(run.finishTime, 'yyyy-mm-dd HH:MM:ss');
        }
        var config = {
            jobId: job.id,
            name: job.name,
            number: number,
            startTime: formatStartTime,
            finishTime: formatFinishTime,
            elapsedTime: run.elapsedTime,
            status: run.status,
            commit: run.commit,
            runId: run.id,
            short_runId: shortRunId,
            commands: commands,
            checkout: run.checkout
       };
       config.view_run = true;
       Hoek.merge(config, commonConfig);
       return cb(config);
   });
};

exports.getTestConfig = function (jobId, runId, artifact, cb) {

    internals.Run.getCommonConfig(function (commonConfig) {

        //console.log(commonConfig);
        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId, function (err, resp, pl) {

            var run = JSON.parse(pl);
            Wreck.get(internals.Run.settings.api.url + '/job/' + jobId, function (err, resp, pl) {

                var job = JSON.parse(pl);
                Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId + '/test/lab.json', function (err, resp, pl) {

                    var config = {
                        view_test: true,
                        jobId: job.id,
                        runId: run.id,
                        jobName: job.name,
                        elapsedTime: run.elapsedTime,
                        status: run.status
                    };
                    if (pl) {
                       if (!pl.match('statusCode')) {
                           config.testResult = JSON.parse(pl);
                       }
                    }  
                    Hoek.merge(config, commonConfig);
                    return cb(config);
                });
            });
        });
    });
};

exports.getCoverageConfig = function (jobId, runId, artifact, cb) {

    internals.Run.getCommonConfig(function (commonConfig) {

        //console.log(commonConfig);
        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId, function (err, resp, pl) {

            var run = JSON.parse(pl);
            Wreck.get(internals.Run.settings.api.url + '/job/' + jobId, function (err, resp, pl) {

                var job = JSON.parse(pl);
                Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId + '/test/lab.json', function (err, resp, pl) {

                    var testResult = JSON.parse(pl);
                    var config = {
                        jobId: job.id,
                        runId: run.id,
                        jobName: job.name,
                        testResult: testResult
                    };
                    config.view_coverage = true;
                    Hoek.merge(config, commonConfig);
                    return cb(config);
                });
            });
        });
    });
};

exports.getFileConfig = function (jobId, runId, file, cb) {

    internals.Run.getCommonConfig(function (commonConfig) {

        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId + '/archive/' + file, function (err, resp, pl) {

            var contents = pl;
            var config = {
                jobId: jobId,
                runId: runId,
                file: file,
                contents: contents
            };
            config.view_file = true;
            Hoek.merge(config, commonConfig);
            return cb(config);
        });
    });
};

exports.deleteRun = function (jobId, runId, cb) {

    Wreck.delete(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId, function (err, resp, pl) {

        return cb();
    });
};

exports.cancelRun = function (jobId, runId, cb) {

    Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId + '/cancel', function (err, resp, pl) {
    
        return cb();
    });
};

exports.cancelPullRequest = function (jobId, number, token, runId, cb) {

    Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/pr/' + number + '/run/' + runId + '/cancel', function (err, resp, pl) {

        return cb();
    });
};
