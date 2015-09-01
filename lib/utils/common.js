var Hoek = require('hoek');
var Smelt = require('smelt');
var Wreck = require('wreck');

var internals = {};

module.exports = internals.Common = function (options) {

//    console.log('initialize common');
    this.settings = options;
    internals.Common.settings = options;
    this.getCommonConfig = exports.getCommonConfig;
};

exports.getCommonConfig = function (cb) {

    Wreck.get(internals.Common.settings.api.url + '/reels', { json: 'true' }, function (err, resp, pl) {

        var reels = [];
        if (!pl.statusCode) {
            reels = pl;
        }
        Wreck.get(internals.Common.settings.api.url + '/queue', { json: 'true' }, function (err2, resp2, pl2) {

            //console.log(pl2);
            var queue = [];
            if (!pl2.statusCode) {
                queue = pl2;
            }
            for (var i = 0; i < queue.length; i++) {
                queue[i].elapsedTime = Math.round(queue[i].elapsedTime / 1000);
                queue[i].num = i + 1;
            }
            Wreck.get(internals.Common.settings.api.url + '/jobs/active', { json: 'true' }, function (err3, resp3, pl3) {

                var activeJobs = {};
                if (!pl3.statusCode) {
                    activeJobs = pl3;
                }
                internals.getFullActiveJobs(0, activeJobs, function (fullActiveJobs) {

                    Wreck.get(internals.Common.settings.api.url + '/prs/active', { json: 'true' }, function (err5, resp5, pl5) {

                        var activePullRequests = {};
                        var activePullRequestsSize = 0;
                        if (!pl5.statusCode) {
                            activePullRequests = pl5;
                        }
                        internals.getFullActivePullRequests(0, activePullRequests, [], function (activeJobsPullRequests) {

                            var config = {
                                reels: reels,
                                queue: queue,
                                //activeJobs: fullActiveJobs,
                                activeJobsSize: Object.keys(activeJobs).length,
                                activeJobs: activeJobs,
                                activeJobsPullRequests: activeJobsPullRequests
                            };
                            //console.log(config);
                            return cb(config);
                        });
                    });
                });
            });
        });
    });
};

internals.getFullActiveJobs = function (i, fullActiveJobs, iajcb) {

    var jobsKeys = Object.keys(fullActiveJobs);
    if (i < jobsKeys.length) {
        var jobId = jobsKeys[i];
        fullActiveJobs[jobId].shortJobId = jobId.split('-')[0];
        fullActiveJobs[jobId].shortRunId = fullActiveJobs[jobId].runId.split('-')[0];
        // maybe i just need last run?
        Wreck.get(internals.Common.settings.api.url + '/job/' + jobId + '/runs', { json: 'force' }, function (err, resp, pl) {

            var runs = [];
            var run = {};
            var prevRun = null;
            var runIndex = null;
            if (!pl.statusCode) {
                runs = pl;
            }
            for (var j = 0; j < runs.length; j++) {
                if (runs[j].id === fullActiveJobs[jobId].runId) {
                    run = runs[j];
                    runIndex = j;
                }
            }
            var now = new Date().getTime();
            var elapsedTime = now - run.startTime;
            fullActiveJobs[jobId].percent = 0;
            fullActiveJobs[jobId].percentColor = 'success';
            fullActiveJobs[jobId].elapsedTime = Math.round(elapsedTime / 1000);
            if (runs.length > 1) {
                prevRun = runs[runIndex + 1];
                fullActiveJobs[jobId].percent = Math.round(elapsedTime / prevRun.elapsedTime * 100);
                if (fullActiveJobs[jobId].percent > 100) {
                    fullActiveJobs[jobId].percent = 100;
                    fullActiveJobs[jobId].percentColor = 'danger';
                }
            }
            internals.getFullProcesses(0, jobId, null, run.commands, fullActiveJobs[jobId].runId, fullActiveJobs[jobId].pids, [], function (fullProcesses) {

                fullActiveJobs[jobId].processes = fullProcesses;
                return internals.getFullActiveJobs(i + 1, fullActiveJobs, iajcb);
            });
        });
    } else {
        return iajcb(fullActiveJobs);
    }
};

internals.getFullProcesses = function (i, jobId, pr, cmds, runId, pids, fullProcesses, gfpcb) {

    if (i < pids.length) {
        var pid = pids[i];
        internals.getActiveCommandByPID(pid, cmds, function (command) {

            var process = {
                jobId: jobId,
                runId: runId,
                pid: pid,
                command: command
            };
            if (pr) {
                process.number = pr;
            }
            fullProcesses.push(process);
            return internals.getFullProcesses(i + 1, jobId, pr, cmds, runId, pids, fullProcesses, gfpcb);
        });
    } else {
        return gfpcb(fullProcesses);
    }
};

internals.getFullActivePullRequests = function (i, activePullRequests, activeJobsPullRequests, gfaprcb) {

    var pullRequestsJobsKeys = Object.keys(activePullRequests);
    if (i < pullRequestsJobsKeys.length) {
        var jobId = pullRequestsJobsKeys[i];
        var prs = activePullRequests[jobId].prs;
        internals.iterateActivePullRequests(0, jobId, prs, [], function (activeJobPullRequests) {

            Hoek.merge(activeJobsPullRequests, activeJobPullRequests);
            return internals.getFullActivePullRequests(i + 1, activePullRequests, activeJobsPullRequests, gfaprcb);
        });
    } else {
        return gfaprcb(activeJobsPullRequests);
    }
};

internals.getActiveCommand = function (cmds) {

    // the last part of the array cant have a finishTime since you will end
    if (!cmds) {
        return 'unknown';
    }
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

internals.getActiveCommandByPID = function (pid, cmds, gaccb) {

    var smelt = new Smelt({});
    smelt.getCommandByPID(pid, function (result) {

        var command;
        if (result.output.match('^git')) {
            command = result.output;
        } else {
            command = internals.getActiveCommand(cmds);
        }
        gaccb(command);
    });
};

internals.iterateActivePullRequests = function (i, jobId, prs, activeJobPullRequests, prcb) {

    var keys = Object.keys(prs);
    if (i < keys.length) {
        var number = keys[i];
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
/*
                var command = internals.getActiveCommand(run.commands);
                pr.processes = [];
                for (var j = 0; j < prs[number].pids.length; j++) {
                    var process = {
                        jobId: jobId,
                        number: number,
                        runId: pr.runId,
                        pid: prs[number].pids[j],
                        command: command
                    };
                    pr.processes.push(process);
                }
                activeJobPullRequests.push(pr);
                return internals.iterateActivePullRequests(i + 1, jobId, prs, activeJobPullRequests, prcb);
*/
                internals.getFullProcesses(0, jobId, number, run.commands, pr.runId, prs[number].pids, [], function (fullProcesses) {

                    pr.processes = fullProcesses;
                    activeJobPullRequests.push(pr);
                    return internals.iterateActivePullRequests(i + 1, jobId, prs, activeJobPullRequests, prcb);
                });
            });
        });
    } else {
        return prcb(activeJobPullRequests);
    }
};
