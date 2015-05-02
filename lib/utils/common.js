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
                var getRun = function (i) {

                    var jobId = jobsKeys[i];
                    if (i < jobsKeys.length) {
                        activeJobs[jobId].shortJobId = jobId.split('-')[0];
                        activeJobs[jobId].shortRunId = activeJobs[jobId].runId.split('-')[0];
                        var now = new Date().getTime();
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
                            getRun(i + 1);
                        });
                    }
                };
                getRun(0);
                Wreck.get(internals.Common.settings.api.url + '/prs/active', { json: 'force' }, function (err, resp, pl) {

                    var activePullRequests = {};
                    if (!pl.statusCode) {
                        activePullRequests = pl;
                    }
                    var config = {
                        reels: reels,
                        queue: queue,
                        activeJobs: activeJobs,
                        activeJobsSize: jobsKeys.length
//                        activePullRequests: activePullRequests,
//                        activePullRequestsSize: pullRequestKeys
                    };
                    return cb(config);
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
