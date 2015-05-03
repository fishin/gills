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
        if (!pl.statusCode) {
            reels = pl;
        }
        Wreck.get(internals.Common.settings.api.url + '/queue', { json: 'force' }, function (err, resp, pl) {

            //console.log(pl);
            var queue = [];
            if (!pl.statusCode) {
                queue = pl;
            }
            Wreck.get(internals.Common.settings.api.url + '/jobs/active', { json: 'force' }, function (err, resp, pl) {

                var activeJobs = {};
                if (!pl.statusCode) {
                    activeJobs = pl;
                }
                var jobsKeys = Object.keys(activeJobs);
                var iterateActiveJobs = function (i) {

                    if (i < jobsKeys.length) {
                        var jobId = jobsKeys[i];
                        activeJobs[jobId].shortJobId = jobId.split('-')[0];
                        activeJobs[jobId].shortRunId = activeJobs[jobId].runId.split('-')[0];
                        Wreck.get(internals.Common.settings.api.url + '/job/' + jobId + '/runs', { json: 'force' }, function (err, resp, pl) {

                            var runs = [];
                            var run = {};
                            var prevRun = null;
                            var runIndex = null;
                            if (!pl.statusCode) {
                                runs = pl;
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
                Wreck.get(internals.Common.settings.api.url + '/prs/active', { json: 'force' }, function (err, resp, pl) {

                    var activePullRequestsSize = 0;
                    if (!pl.statusCode) {
                        activePullRequests = pl;
                    }
                    var pullRequestsJobsKeys = Object.keys(activePullRequests);
                    var iterateActiveJobs = function (i, jobsArray, jobscb) {

                        if (i < pullRequestsJobsKeys.length) {
                            var jobId = pullRequestsJobsKeys[i];
                            var prs = activePullRequests[jobId].prs;
                            internals.iterateActivePullRequests(0, jobId, prs, [], function (prArray) {

                                Hoek.merge(jobsArray, prArray);
                                return iterateActiveJobs(i + 1, jobsArray, jobscb);
                            });
                        } else {
                            return jobscb(jobsArray);
                        }
                    };
                    iterateActiveJobs(0, [], function (pullRequestsArray) {

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
    var end = cmds.length - 1;
    for (var i = 0; i < end; i++) {
        //console.log(cmds[i]);
        if (!cmds[i].finishTime) {
            //console.log(cmds[i].command);
            return cmds[i].command;
        }
        if (i === end - 1 && cmds[i].finishTime) {
            return cmds[end].command;
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
        //console.log(internals.Common.settings.api.url + '/job/' + jobId + '/pr/' + pr.number + '/run/' + prs[number].runId);
        Wreck.get(internals.Common.settings.api.url + '/job/' + jobId + '/pr/' + pr.number + '/run/' + prs[number].runId, { json: 'force' }, function (err, resp, pl) {

            var run = {};
            var prevRun = null;
            var runIndex = null;
            if (pl && !pl.statusCode) {
                run = pl;
            }
            Wreck.get(internals.Common.settings.api.url + '/job/' + jobId + '/run/byname/last', { json: 'force' }, function (err, resp, pl) {

                var prevRun = null;
                if (!pl.statusCode) {
                    prevRun = pl;
                }
                var now = new Date().getTime();
                var elapsedTime = now - run.startTime;
                pr.percent = 0;
                pr.percentColor = 'success';
                pr.elapsedTime = Math.round(elapsedTime / 1000);
                if (prevRun) {
                    prevRun.elapsedTime = prevRun.finishTime - prevRun.startTime;
                    pr.percent = Math.round(elapsedTime / prevRun.elapsedTime * 100);
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
