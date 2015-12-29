'use strict';

const Hoek = require('hoek');
const Smelt = require('smelt');
const Wreck = require('wreck');

const internals = {};

module.exports = internals.Common = function (options) {

    this.settings = options;
    internals.Common.settings = options;
    this.getCommonConfig = exports.getCommonConfig;
};

exports.getCommonConfig = function (cb) {

    Wreck.get(internals.Common.settings.api.url + '/reels', { json: 'true' }, (err, resp, pl) => {

        Hoek.assert(!err, err);
        let reels = [];
        if (!pl.statusCode) {
            reels = pl;
        }
        Wreck.get(internals.Common.settings.api.url + '/queue', { json: 'true' }, (err2, resp2, pl2) => {

            Hoek.assert(!err2, err2);
            let queue = [];
            if (!pl2.statusCode) {
                queue = pl2;
            }
            for (let i = 0; i < queue.length; ++i) {
                queue[i].elapsedTime = internals.Common.settings.displayTimeString(queue[i].elapsedTime);
                queue[i].num = i + 1;
            }
            Wreck.get(internals.Common.settings.api.url + '/jobs/active', { json: 'true' }, (err3, resp3, pl3) => {

                Hoek.assert(!err3, err3);
                let activeJobs = {};
                if (!pl3.statusCode) {
                    activeJobs = pl3;
                }
                internals.getFullActiveJobs(0, activeJobs, (fullActiveJobs) => {

                    Wreck.get(internals.Common.settings.api.url + '/prs/active', { json: 'true' }, (err5, resp5, pl5) => {

                        Hoek.assert(!err5, err5);
                        let activePullRequests = {};
                        if (!pl5.statusCode) {
                            activePullRequests = pl5;
                        }
                        internals.getFullActivePullRequests(0, activePullRequests, [], (activeJobsPullRequests) => {

                            const memory = process.memoryUsage();
                            const formatMemory = {
                                rss: Math.round(memory.rss / (1024 * 1024)) + ' mb',
                                heapTotal: Math.round(memory.heapTotal / (1024 * 1024)) + ' mb',
                                heapUsed: Math.round(memory.heapUsed / (1024 * 1024)) + ' mb'
                            };
                            const config = {
                                reels: reels,
                                queue: queue,
                                memory: formatMemory,
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

internals.getFullActiveJobs = function (j, fullActiveJobs, iajcb) {

    const jobsKeys = Object.keys(fullActiveJobs);
    if (j < jobsKeys.length) {
        const jobId = jobsKeys[j];
        fullActiveJobs[jobId].shortJobId = jobId.split('-')[0];
        fullActiveJobs[jobId].shortRunId = fullActiveJobs[jobId].runId.split('-')[0];
        // maybe i just need last run?
        Wreck.get(internals.Common.settings.api.url + '/job/' + jobId + '/runs', { json: 'force' }, (err, resp, pl) => {

            Hoek.assert(!err, err);
            let runs = [];
            let run = {};
            let prevRun = null;
            let runIndex = null;
            if (!pl.statusCode) {
                runs = pl;
            }
            for (let i = 0; i < runs.length; ++i) {
                if (runs[i].id === fullActiveJobs[jobId].runId) {
                    run = runs[i];
                    runIndex = i;
                }
            }
            const now = new Date().getTime();
            const elapsedTime = now - run.startTime;
            fullActiveJobs[jobId].percent = 0;
            fullActiveJobs[jobId].percentColor = 'success';
            fullActiveJobs[jobId].elapsedTime = internals.Common.settings.displayTimeString(elapsedTime);
            if (runs.length > 1) {
                prevRun = runs[runIndex + 1];
                fullActiveJobs[jobId].percent = Math.round(elapsedTime / prevRun.elapsedTime * 100);
                if (fullActiveJobs[jobId].percent > 100) {
                    fullActiveJobs[jobId].percent = 100;
                    fullActiveJobs[jobId].percentColor = 'danger';
                }
            }
            internals.getFullProcesses(0, jobId, null, run.commands, fullActiveJobs[jobId].runId, fullActiveJobs[jobId].pids, [], (fullProcesses) => {

                fullActiveJobs[jobId].processes = fullProcesses;
                return internals.getFullActiveJobs(j + 1, fullActiveJobs, iajcb);
            });
        });
    }
    else {
        return iajcb(fullActiveJobs);
    }
};

internals.getFullProcesses = function (i, jobId, pr, cmds, runId, pids, fullProcesses, gfpcb) {

    if (i < pids.length) {
        const pid = pids[i];
        internals.getActiveCommandByPID(pid, cmds, (command) => {

            const process = {
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
    }
    else {
        return gfpcb(fullProcesses);
    }
};

internals.getFullActivePullRequests = function (i, activePullRequests, activeJobsPullRequests, gfaprcb) {

    const pullRequestsJobsKeys = Object.keys(activePullRequests);
    if (i < pullRequestsJobsKeys.length) {
        const jobId = pullRequestsJobsKeys[i];
        const prs = activePullRequests[jobId].prs;
        internals.iterateActivePullRequests(0, jobId, prs, [], (activeJobPullRequests) => {

            Hoek.merge(activeJobsPullRequests, activeJobPullRequests);
            return internals.getFullActivePullRequests(i + 1, activePullRequests, activeJobsPullRequests, gfaprcb);
        });
    }
    else {
        return gfaprcb(activeJobsPullRequests);
    }
};

internals.getActiveCommand = function (cmds) {

    // the last part of the array cant have a finishTime since you will end
    if (!cmds) {
        return 'unknown';
    }
    for (let i = 0; i < cmds.length - 1; ++i) {
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

    const smelt = new Smelt({});
    smelt.getCommandByPID(pid, (result) => {

        let command;
        if (result.output.match('^git')) {
            command = result.output;
        }
        else {
            command = internals.getActiveCommand(cmds);
        }
        gaccb(command);
    });
};

internals.iterateActivePullRequests = function (i, jobId, prs, activeJobPullRequests, prcb) {

    const keys = Object.keys(prs);
    if (i < keys.length) {
        const number = keys[i];
        const pr = {
            jobId: jobId,
            runId: prs[number].runId,
            number: number,
            shortJobId: jobId.split('-')[0],
            shortRunId: prs[number].runId.split('-')[0]
        };
        Wreck.get(internals.Common.settings.api.url + '/job/' + jobId + '/pr/' + pr.number + '/run/' + prs[number].runId, { json: 'force' }, (err, resp, pl) => {

            Hoek.assert(!err, err);
            let run = {
                commands: []
            };
            if (!pl.statusCode) {
                run = pl;
            }
            Wreck.get(internals.Common.settings.api.url + '/job/' + jobId + '/run/byname/lastSuccess', { json: 'force' }, (err2, resp2, pl2) => {

                Hoek.assert(!err2, err2);
                let lastSuccess = null;
                if (pl2 !== null && !pl2.statusCode) {
                    lastSuccess = pl2;
                }
                const now = new Date().getTime();
                const elapsedTime = now - run.startTime;
                pr.percent = 100;
                pr.percentColor = 'success';
                pr.elapsedTime = internals.Common.settings.displayTimeString(elapsedTime);
                if (lastSuccess) {
                    lastSuccess.elapsedTime = lastSuccess.finishTime - lastSuccess.startTime;
                    pr.percent = Math.round(elapsedTime / lastSuccess.elapsedTime * 100);
                    if (pr.percent > 100) {
                        pr.percent = 100;
                        pr.percentColor = 'danger';
                    }
                }
                internals.getFullProcesses(0, jobId, number, run.commands, pr.runId, prs[number].pids, [], (fullProcesses) => {

                    pr.processes = fullProcesses;
                    activeJobPullRequests.push(pr);
                    return internals.iterateActivePullRequests(i + 1, jobId, prs, activeJobPullRequests, prcb);
                });
            });
        });
    }
    else {
        return prcb(activeJobPullRequests);
    }
};
