var DateFormat = require('dateformat');
var Hoek = require('hoek');
var Wreck = require('wreck');
var Common = require('./common');

var internals = {};

module.exports = internals.Run = function (options) {

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
        viewRun: true,
        jobId: jobId
    };
    internals.Run.getCommonConfig(function (commonConfig) {

        //console.log(commonConfig);
        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId, { json: true }, function (err, resp, pl) {

            var job = pl;
            config.name = job.name;
            Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId, { json: true }, function (err2, resp2, pl2) {

                var run = pl2;
                config.runId = run.id;
                config.status = run.status;
                config.commit = run.commit;
                config.checkout = run.checkout;
                var checkoutStartTime;
                if (config.checkout && config.checkout.startTime) {
                    checkoutStartTime = config.checkout.startTime;
                    config.checkout.startTime = DateFormat(checkoutStartTime, 'yyyy-mm-dd HH:MM:ss');
                }
                if (config.checkout && config.checkout.finishTime) {
                    var checkoutFinishTime = config.checkout.finishTime;
                    config.checkout.elapsedTime = checkoutFinishTime - checkoutStartTime;
                    config.checkout.finishTime = DateFormat(checkoutFinishTime, 'yyyy-mm-dd HH:MM:ss');
                }
                config.shortRunId = run.id.split('-')[0];
                Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/runs', { json: true }, function (err3, resp3, pl3) {

                    var runs = pl3;
                    // set default as itself with override later
                    var comparePayload = {
                        commit1: config.commit,
                        commit2: config.commit
                    };
                    for (var i = 0; i < runs.length; i++) {
                        // figure out which runIndex it is
                        if (runs[i].id === runId) {
                            // get the prev run if its not the first one
                            if (i !== runs.length - 1) {
                                comparePayload.commit2 = runs[i + 1].commit;
                            }
                        }
                    }
                    Wreck.post(internals.Run.settings.api.url + '/job/' + jobId + '/commits/compare', { payload: JSON.stringify(comparePayload), json: true }, function (err4, resp4, pl4) {

                        config.compareCommits = pl4;
                        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + run.id + '/test/lab.json', { json: true }, function (err5, resp5, pl5) {

                            config.testResult = pl5;
                            Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId + '/archive', { json: true }, function (err6, resp6, pl6) {

                                var files = pl6;
                                config.archiveFiles = [];
                                for (var j = 0; j < files.length; j++) {
                                    var fileConfig = {
                                        jobId: jobId,
                                        runId: runId,
                                        file: files[j]
                                    };
                                    config.archiveFiles.push(fileConfig);
                                }
                                config.commands = [];
                                for (var k = 0; k < run.commands.length; k++) {
                                    //console.log(run.commands[k]);
                                    var startTime = run.commands[k].startTime;
                                    if (run.commands[k].startTime) {
                                        run.commands[k].startTime = DateFormat(startTime, 'yyyy-mm-dd HH:MM:ss');
                                    }
                                    if (run.commands[k].finishTime) {
                                        run.commands[k].elapsedTime = run.commands[k].finishTime - startTime;
                                        run.commands[k].finishTime = DateFormat(run.commands[k].finishTime, 'yyyy-mm-dd HH:MM:ss');
                                    }
                                    config.commands.push(run.commands[k]);
                                }
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
    });
};

exports.getPullRequestRunConfig = function (jobId, number, runId, cb) {

    var config = {
        viewRun: true,
        jobId: jobId,
        number: number,
        runId: runId
    };
    internals.Run.getCommonConfig(function (commonConfig) {

        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId, function (err, resp, pl) {

            var job = JSON.parse(pl);
            config.name = job.name;
            Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/pr/' + number, function (err2, resp2, pl2) {

                var pr = JSON.parse(pl2);
                Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/pr/' + number + '/run/' + runId, function (err3, resp3, pl3) {

                    var run = JSON.parse(pl3);
                    config.status = run.status;
                    config.commit = run.commit;
                    config.checkout = run.checkout;
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
                    config.shortRunId = runId.split('-')[0];
                    config.startTime = DateFormat(run.startTime, 'yyyy-mm-dd HH:MM:ss');
                    if (run.finishTime) {
                        config.finishTime = DateFormat(run.finishTime, 'yyyy-mm-dd HH:MM:ss');
                        config.elapsedTime = run.elapsedTime;
                    }
                    Hoek.merge(config, commonConfig);
                    return cb(config);
                });
            });
        });
    });
};

exports.getTestConfig = function (jobId, runId, artifact, cb) {

    internals.Run.getCommonConfig(function (commonConfig) {

        //console.log(commonConfig);
        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId, { json: 'forced' }, function (err, resp, pl) {

            var run = null;
            if (pl !== null && !pl.statusCode) {
                run = pl;
            }
            Wreck.get(internals.Run.settings.api.url + '/job/' + jobId, { json: 'forced' }, function (err2, resp2, pl2) {

                var job = null;
                if (pl2 !== null && !pl2.statusCode) {
                    job = pl2;
                }
                Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId + '/test/lab.json', { json: 'forced' }, function (err3, resp3, pl3) {

                    var config = {
                        viewTest: true,
                        jobId: job.id,
                        runId: run.id,
                        jobName: job.name,
                        elapsedTime: run.elapsedTime,
                        status: run.status
                    };
                    if (pl3 !== null && !pl3.statusCode) {
                        config.testResult = pl3;
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
            Wreck.get(internals.Run.settings.api.url + '/job/' + jobId, function (err2, resp2, pl2) {

                var job = JSON.parse(pl);
                Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId + '/test/lab.json', function (err3, resp3, pl3) {

                    var testResult = JSON.parse(pl3);
                    var config = {
                        jobId: job.id,
                        runId: run.id,
                        jobName: job.name,
                        testResult: testResult
                    };
                    config.viewCoverage = true;
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
            config.viewFile = true;
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

exports.cancelPullRequest = function (jobId, number, runId, cb) {

    Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/pr/' + number + '/run/' + runId + '/cancel', function (err, resp, pl) {

        return cb();
    });
};
