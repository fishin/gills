var Hoek = require('hoek');
var Wreck = require('wreck');

var internals = {};

module.exports = internals.Common = function (options) {

    this.settings = options;
    internals.Common.settings = options;
    this.getCommonConfig = exports.getCommonConfig;
};

exports.getCommonConfig = function (cb) {

    Wreck.get(internals.Common.settings.api.url + '/reels', { json: 'force' }, function (err, resp, pl) {

        var reels = [];
        if (pl !== null && !pl.statusCode) {
            reels = pl;
        }
        Wreck.get(internals.Common.settings.api.url + '/queue', { json: 'force' }, function (err2, resp2, pl2) {

            //console.log(pl2);
            var queue = [];
            if (!pl2.statusCode) {
                queue = pl2;
            }
            Wreck.get(internals.Common.settings.api.url + '/jobs/active', { json: 'force' }, function (err3, resp3, pl3) {

                var activeJobs = {};
                if (!pl3.statusCode) {
                    activeJobs = pl3;
                }
                var jobsKeys = Object.keys(activeJobs);
                var iterateActiveJobs = function (i) {

                    if (i < jobsKeys.length) {
                        var jobId = jobsKeys[i];
                        activeJobs[jobId].shortJobId = jobId.split('-')[0];
                        activeJobs[jobId].shortRunId = activeJobs[jobId].runId.split('-')[0];
                        Wreck.get(internals.Common.settings.api.url + '/job/' + jobId + '/runs', { json: 'force' }, function (err4, resp4, pl4) {

                            var runs = [];
                            var run = {};
                            var prevRun = null;
                            var runIndex = null;
                            if (!pl4.statusCode) {
                                runs = pl4;
                            }
                            for (var j = 0; j < runs.length; j++) {
                                if (runs[j].id === activeJobs[jobId].runId) {
                                    run = runs[j];
                                    runIndex = j;
                                }
                            }
                            var now = new Date().getTime();
                            var elapsedTime = now - run.startTime;
                            activeJobs[jobId].percent = 0;
                            activeJobs[jobId].percentColor = 'success';
                            activeJobs[jobId].elapsedTime = Math.round(elapsedTime / 1000);
                            if (runs.length > 1) {
                                prevRun = runs[runIndex + 1];
                                activeJobs[jobId].percent = Math.round(elapsedTime / prevRun.elapsedTime * 100);
                                if (activeJobs[jobId].percent > 100) {
                                    activeJobs[jobId].percent = 100;
                                    activeJobs[jobId].percentColor = 'danger';
                                }
                            }
                            var command = internals.getActiveCommand(run.commands);
                            activeJobs[jobId].processes = [];
                            for (var k = 0; k < activeJobs[jobId].pids.length; k++) {
                                var process = {
                                    jobId: jobId,
                                    runId: activeJobs[jobId].runId,
                                    pid: activeJobs[jobId].pids[k],
                                    command: command
                                };
                                activeJobs[jobId].processes.push(process);
                            }
                            iterateActiveJobs(i + 1);
                        });
                    }
                };
                iterateActiveJobs(0);
                var activePullRequests = {};
                Wreck.get(internals.Common.settings.api.url + '/prs/active', { json: 'force' }, function (err5, resp5, pl5) {

                    var activePullRequestsSize = 0;
                    if (!pl5.statusCode) {
                        activePullRequests = pl5;
                    }
                    var pullRequestsJobsKeys = Object.keys(activePullRequests);
                    var iterateActiveJobs2 = function (i, jobsArray, jobscb) {

                        if (i < pullRequestsJobsKeys.length) {
                            var jobId = pullRequestsJobsKeys[i];
                            var prs = activePullRequests[jobId].prs;
                            internals.iterateActivePullRequests(0, jobId, prs, [], function (prArray) {

                                Hoek.merge(jobsArray, prArray);
                                return iterateActiveJobs2(i + 1, jobsArray, jobscb);
                            });
                        } else {
                            return jobscb(jobsArray);
                        }
                    };
                    iterateActiveJobs2(0, [], function (pullRequestsArray) {

                        var config = {
                            reels: reels,
                            queue: queue,
                            activeJobs: activeJobs,
                            activeJobsSize: jobsKeys.length,
                            activeJobsPullRequests: pullRequestsArray
                        };
                        return cb(config);
                    });
                });
            });
        });
    });
};

internals.getActiveCommand = function (cmds) {

    // the last part of the array cant have a finishTime since you will end
    //console.log(cmds);
    for (var i = 0; i < cmds.length - 1; i++) {
        //console.log(cmds[i]);
        if (!cmds[i].finishTime) {
            //console.log(cmds[i].command);
            return cmds[i].command;
        }
        if (i === cmds.length - 2 && cmds[i].finishTime) {
            //console.log(cmds[i].command);
            // return prev command
            return cmds[cmds.length - 1].command;
        }
    }
};

internals.iterateActivePullRequests = function (j, jobId, prs, prsArray, prcb) {

    var keys = Object.keys(prs);
    if (j < keys.length) {
        var number = keys[j];
        var pr = {
            jobId: jobId,
            runId: prs[number].runId,
            number: number,
            shortJobId: jobId.split('-')[0],
            shortRunId: prs[number].runId.split('-')[0]
        };
        Wreck.get(internals.Common.settings.api.url + '/job/' + jobId + '/pr/' + pr.number + '/run/' + prs[number].runId, { json: 'force' }, function (err, resp, pl) {

            var run = {
                commands: []
            };
            var prevRun = null;
            var runIndex = null;
            if (!pl.statusCode) {
                run = pl;
            }
            Wreck.get(internals.Common.settings.api.url + '/job/' + jobId + '/run/byname/lastSuccess', { json: 'force' }, function (err2, resp2, pl2) {

                var lastSuccess = null;
                if (pl2 !== null && !pl2.statusCode) {
                    lastSuccess = pl2;
                }
                var now = new Date().getTime();
                var elapsedTime = now - run.startTime;
                pr.percent = 100;
                pr.percentColor = 'success';
                pr.elapsedTime = Math.round(elapsedTime / 1000);
                if (lastSuccess) {
                    lastSuccess.elapsedTime = lastSuccess.finishTime - lastSuccess.startTime;
                    pr.percent = Math.round(elapsedTime / lastSuccess.elapsedTime * 100);
                    if (pr.percent > 100) {
                        pr.percent = 100;
                        pr.percentColor = 'danger';
                    }
                }
                var command = internals.getActiveCommand(run.commands);
                pr.processes = [];
                for (var l = 0; l < prs[number].pids.length; l++) {
                    var process = {
                        jobId: jobId,
                        number: number,
                        runId: pr.runId,
                        pid: prs[number].pids[l],
                        command: command
                    };
                    pr.processes.push(process);
                }
                prsArray.push(pr);
                return internals.iterateActivePullRequests(j + 1, jobId, prs, prsArray, prcb);
            });
        });
    } else {
        return prcb(prsArray);
    }
};
