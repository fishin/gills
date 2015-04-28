var DateFormat = require('dateformat');
var Hoek = require('hoek');
var Wreck = require('wreck');
var Common = require('./common');

var internals = {};

module.exports = internals.Job = function (options) {

    this.settings = options;
    internals.Job.settings = options;
    var common = new Common(options);
    internals.Job.getCommonConfig = common.getCommonConfig;
    this.getJobsConfig = exports.getJobsConfig;
    this.getJobConfig = exports.getJobConfig;
    this.getJobCreateConfig = exports.getJobCreateConfig;
    this.getCommitsConfig = exports.getCommitsConfig;
    this.startJob = exports.startJob;
    this.startPullRequest = exports.startPullRequest;
    this.createJob = exports.createJob;
    this.deleteJob = exports.deleteJob;
    this.deleteWorkspace = exports.deleteWorkspace;
    this.updateJob = exports.updateJob;
    this.mergePullRequest = exports.mergePullRequest;
    this.retryPullRequest = exports.retryPullRequest;
};

exports.startJob = function (jobId, cb) {

    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/start', function (err, resp, pl) {

        //console.log(pl);
        var runId = pl;
        return cb();
    });
};

exports.startPullRequest = function (jobId, number, token, cb) {

    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number, function (err, resp, pl) {

        var pr = JSON.parse(pl);
        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number + '/start', function (err, resp, pl) {

            var runId = pl;
            return cb(runId);
        });
    });
};

exports.getJobsConfig = function (cb) {

    internals.Job.getCommonConfig(function (commonConfig) {

        var config = {
           viewJobs: true,
           jobs: []
        };
        Wreck.get(internals.Job.settings.api.url + '/jobs', function (err, resp, pl) {

            var jobs = JSON.parse(pl);
            var getLastName = function getLastRun (i) {

                if (i < jobs.length) {
                    Wreck.get(internals.Job.settings.api.url + '/job/' + jobs[i].id + '/run/byname/last', { json: 'force' }, function (err, resp, pl) {

                        var job = jobs[i];
                        job.jobId = job.id;
                        var lastRun = null;
                        //console.log(pl);
                        if (pl !== null && !pl.statusCode) {
                            lastRun = pl;
                            job.runId = lastRun.id;
                            if (lastRun.status === 'succeeded' ) {
                                job.classColor = 'success';
                            }
                            if (lastRun.status === 'failed') {
                                job.classColor = 'danger';
                            }
                        }
                        config.jobs.push(job);
                        getLastRun(i + 1);
                    });
                } else {
                    Hoek.merge(config, commonConfig);
                    return cb(config);
                }
            };
            getLastName(0);
        });
    });
};

exports.createJob = function (payload, cb) {

    var headCommands = [];
    var bodyCommands = [];
    var tailCommands = [];
    for (var key in payload) {
        if (key.match('headCommand')) {
            if (payload[key] !== '') {
                headCommands.push(payload[key]);
            }
            delete payload[key];
        }
        if (key.match('bodyCommand')) {
            if (payload[key] !== '') {
                bodyCommands.push(payload[key]);
            }
            delete payload[key];
        }
        if (key.match('tailCommand')) {
            if (payload[key] !== '') {
                tailCommands.push(payload[key]);
            }
            delete payload[key];
        }
    }
    payload.head = headCommands;
    payload.body = bodyCommands;
    payload.tail = tailCommands;
    var config = {
        name: payload.name,
        description: payload.description,
        head: payload.head,
        body: payload.body,
        tail: payload.tail
    };
    if (payload.scmType === 'git') {
        config.scm = {
            type: payload.scmType,
            url: payload.scmUrl,
            branch: payload.scmBranch
        };
        if (payload.scmPrs) {
            config.scm.prs = true;
        } else {
            config.scm.prs = false;
        }
        if (payload.scmRunOnCommit) {
            config.scm.runOnCommit = true;
        } else {
            config.scm.runOnCommit = false;
        }
    }
    if (payload.cronPattern !== '') {
        config.schedule = {
            type: payload.scheduleType,
            pattern: payload.cronPattern
        };
    } else {
        config.schedule = {
            type: 'none',
            pattern: payload.cronPattern
        };
    }
    if (payload.archivePattern !== '') {
        config.archive = {
            pattern: payload.archivePattern
        };
    }
    Wreck.post(internals.Job.settings.api.url + '/job', { payload: JSON.stringify(config) }, function (err, resp, pl) {

        var createConfig = JSON.parse(pl);
        var jobId = createConfig.id;
        return cb(createConfig);
    });
};

exports.getJobCreateConfig = function (cb) {

    internals.Job.getCommonConfig(function (commonConfig) {

        var config = {};
        config.postUrl = internals.Job.settings.viewPath + '/job';
        config.viewJob = true;
        config.scheduleType = 'none';
        Hoek.merge(config, commonConfig);
        return cb(config);
    });
};

exports.getJobConfig = function (jobId, token, cb) {

    internals.Job.getCommonConfig(function (commonConfig) {

        var finishedRuns = [];
        var activeRuns = [];
        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId, function (err, resp, pl) {

            //console.log(pl);
            var job = {};
            if (pl) {
                job = JSON.parse(pl);
            }
            if (!job.schedule) {
                job.schedule = {};
            }
            if (!job.archive) {
                job.archive = {};
            }
            var config = {
                postUrl: internals.Job.settings.viewPath + '/job/' + job.id,
                viewJob: true,
                jobId: job.id,
                name: job.name,
                description: job.description,
                head: job.head,
                scheduleType: job.schedule.type,
                cronPattern: job.schedule.pattern,
                archivePattern: job.archive.pattern,
                body: job.body,
                tail: job.tail
            };
            // convert to form
            if (job.head) {
                for (var i = 0; i < job.head.length; i++) {
                    var keyName1 = 'headCommand' + i;
                    config[keyName1] = job.head[i];
                }
            }
            if (job.body) {
                for (var j = 0; j < job.body.length; j++) {
                    var keyName2 = 'bodyCommand' + j;
                    config[keyName2] = job.body[j];
                }
            }
            if (job.tail) {
                for (var k = 0; k < job.tail.length; k++) {
                    var keyName3 = 'tailCommand' + k;
                    config[keyName3] = job.tail[k];
                }
            }
            Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/runs', function (err, resp, pl) {

                var runs = JSON.parse(pl);
                for (var i = 0; i < runs.length; i++) {
                    var runId = runs[i].id;
                    var run = runs[i];
                    var shortId = runId.split('-')[0];
                    var formatTime;
                    var elapsedTime;
                    var runConfig = {
                        jobId: jobId,
                        runId: runId,
                        shortId: shortId,
                        createTime: run.createTime,
                        startTime: run.startTime,
                        status: run.status
                    };
                    if (run.finishTime) {
                        formatTime = DateFormat(run.finishTime, 'yyyy-mm-dd HH:MM:ss');
                        elapsedTime = run.finishTime - run.startTime;
                        runConfig.finishTime = formatTime;
                        runConfig.elapsedTime = Math.round(elapsedTime / 1000);
                    } else {
                        runConfig.finishTime = 'died';
                        runConfig.classColor = 'info';
                    }
                    if (run.status === 'succeeded' ) {
                        runConfig.classColor = 'success';
                    }
                    if (run.status === 'failed') {
                        runConfig.classColor = 'danger';
                    }
                    finishedRuns.push(runConfig);
                }
                var lastRunId = null;
                var lastCommit;
                var comparePayload = {};
                if (runs.length > 0) {
                    lastRunId = runs[0].id;
                    config.runId = lastRunId;
                    lastCommit = runs[0].commit;
                    comparePayload.commit1 = lastCommit;
                    comparePayload.commit2 = lastCommit;
                    config.lastCommit = lastCommit;
                    if (runs.length > 1) {
                        if (runs[1].commit) {
                            comparePayload.commit2 = runs[1].commit;
                        }
                    }
                }
                Wreck.post(internals.Job.settings.api.url + '/job/' + jobId + '/commits/compare', { payload: JSON.stringify(comparePayload) }, function (err, resp, pl) {

                    config.compareCommits = JSON.parse(pl);
                    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/run/' + lastRunId + '/pids', function (err, resp, pl) {

                        var pids = JSON.parse(pl);
                        if (pids[0]) {
                            var shortId = runs[0].id.split('-')[0];
                            var runConfig = {
                                jobId: jobId,
                                runId: runs[0].id,
                                shortId: shortId,
                                createTime: run.createTime,
                                startTime: run.startTime,
                                status: run.status
                            };
                            //console.log(pids);
                            //figure out prev run
                            var percent = 0;
                            var now = new Date().getTime();
                            elapsedTime = now - runs[0].startTime;
                            if (runs.length !== 1 ) {
                                var prevRun = runs[1];
                                //if (prevRun.elapsedTime) {
                                percent = Math.round(elapsedTime / prevRun.elapsedTime * 100);
                                //console.log(percent);
                                //}
                            }
                            runConfig.elapsedTime = Math.round(elapsedTime / 1000);
                            runConfig.percent = percent;
                            var command = internals.getActiveCommand(runs[0].commands);
                            runConfig.processes = [];
                            for (var j = 0; j < pids.length; j++) {
                                var process = {
                                    jobId: jobId,
                                    runId: runs[0].id,
                                    pid: pids[j],
                                    command: command
                                };
                                runConfig.processes.push(process);
                            }
                            //console.log(run.commands);
                            activeRuns.push(runConfig);
                            // remove the finished Runs first one as it was really active
                            finishedRuns.splice(0, 1);
                        }
                        config.activeRuns = activeRuns;
                        config.finishedRuns = finishedRuns;
                        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/run/' + lastRunId + '/test/lab.json', { json: 'force' }, function (err, resp, pl) {

                            // returns a status code when invalid lastRunId
                            //console.log(pl);
                            if (pl !== null && !pl.statusCode) {
                                config.testResult = pl;
                            }
                            config.scmPrs = 0;
                            Hoek.merge(config, commonConfig);
                            if (job.scm) {
                                config.scmType = job.scm.type;
                                config.scmUrl = job.scm.url;
                                config.scmBranch = job.scm.branch;
                                if (job.scm.runOnCommit) {
                                    config.scmRunOnCommit = 1;
                                }
                                if (job.scm.prs) {
                                    config.scmPrs = 1;
                                    internals.getPullRequestsConfig(jobId, token, runs[0], config, function (finalConfig) {

                                        return cb(finalConfig);
                                    });
                                } else {
                                    return cb(config);
                                }
                            } else {
                                return cb(config);
                            }
                        });
                    });
                });
            });
        });
    });
};

exports.updateJob = function (jobId, payload, cb) {

    var headCommands = [];
    var bodyCommands = [];
    var tailCommands = [];
    for (var key in payload) {
       //console.log(key + ':' + payload[key]);
        if (key.match('headCommand')) {
            if (payload[key] !== '') {
                headCommands.push(payload[key]);
            }
            delete payload[key];
        }
        if (key.match('bodyCommand')) {
            if (payload[key] !== '') {
                bodyCommands.push(payload[key]);
            }
            delete payload[key];
        }
        if (key.match('tailCommand')) {
            if (payload[key] !== '') {
                tailCommands.push(payload[key]);
            }
            delete payload[key];
        }
    }
    var config = {
        name: payload.name,
        description: payload.description
    };
    if (payload.scmType === 'git') {
        config.scm = {
            type: payload.scmType,
            url: payload.scmUrl,
            branch: payload.scmBranch
        };
        if (payload.scmPrs) {
            config.scm.prs = true;
        } else {
            config.scm.prs = false;
        }
        if (payload.scmRunOnCommit) {
            config.scm.runOnCommit = true;
        } else {
            config.scm.runOnCommit = false;
        }
    }
    if (payload.cronPattern !== '') {
        config.schedule = {
            type: payload.scheduleType,
            pattern: payload.cronPattern
        };
    } else {
        config.schedule = {
            type: 'none',
            pattern: payload.cronPattern
        };
    }
    if (payload.archivePattern !== '') {
        config.archive = {
            pattern: payload.archivePattern
        };
    }
    config.head = headCommands;
    config.body = bodyCommands;
    config.tail = tailCommands;
    //console.log(jobId);
    Wreck.post(internals.Job.settings.api.url + '/job/' + jobId, { payload: JSON.stringify(config) }, function (err, resp, pl) {

        var updateConfig = JSON.parse(pl);
        return cb();
    });
};

exports.deleteJob = function (jobId, cb) {

    Wreck.delete(internals.Job.settings.api.url + '/job/' + jobId, function (err, resp, pl) {

        return cb();
    });
};

exports.deleteWorkspace = function (jobId, cb) {


    Wreck.delete(internals.Job.settings.api.url + '/job/' + jobId + '/workspace', function (err, resp, pl) {

        return cb();
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

exports.getCommitsConfig = function (jobId, cb) {

    internals.Job.getCommonConfig(function (commonConfig) {

        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId, function (err, resp, pl) {

            var job = JSON.parse(pl);
            Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/commits', function (err, resp, pl) {

                //console.log(pl);
                var commits = JSON.parse(pl);
                // add repoUrl
                for (var i = 0; i < commits.length; i++) {
                    commits[i].repoUrl = job.scm.url;
                }
                var config = {
                    viewCommits: true,
                    jobId: jobId,
                    jobName: job.name,
                    commits: commits
                };
                Hoek.merge(config, commonConfig);
                return cb(config);
            });
        });
    });
};

exports.mergePullRequest = function (jobId, number, token, cb) {

    //console.log('attempting to merge pull request: ' + number + ' with token: ' + token);
    var options = {
        headers: {
            githubtoken: token
        }
    };
    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number + '/merge', options, function (err, resp, pl) {

        var result = JSON.parse(pl);
        return cb(result);
    });
};

exports.retryPullRequest = function (jobId, number, cb) {

    console.log('retrying pull request: ' + number);
    Wreck.delete(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number, function (err, resp, pl) {

        return cb();
    });
};

internals.getPullRequestsConfig = function (jobId, token, lastRun, config, cb2) {

//    return cb(config);
    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/prs', function (err, resp, pl) {

        var prs = [];
        if (pl) {
            prs = JSON.parse(pl);
        }
        config.newPullRequests = [];
        config.activePullRequests = [];
        config.checkedPullRequests = [];
        var getLastName = function getLastRun (i) {

            if (i < prs.length) {
                prs[i].jobId = jobId;
                // initialize 3 states of the pull request
                Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + prs[i].number + '/runs', function (err, resp, pl) {

                    var prRuns = JSON.parse(pl);
                    if (prRuns.length === 0) {
                        // its new
                        config.newPullRequests.push(prs[i]);
                        if (internals.Job.settings.prs.autoStart) {
                            console.log('starting pr check for: ' + prs[i].number);
                            Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + prs[i].number + '/start', function (err, resp, pl) {

                                getLastRun(i + 1);
                            });
                        } else {
                            getLastRun(i + 1);
                        }
                    } else {
                        var runId = prRuns[0].id;
                        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + prs[i].number + '/run/' + runId + '/pids', function (err, resp, pl) {

                            var pids = JSON.parse(pl);
                            var percent = 0;
                            var now = new Date().getTime();
                            var elapsedTime = now - prRuns[0].startTime;
                            lastRun = lastRun || {};
                            // set a default of 1 sec
                            if (!lastRun.elapsedTime) {
                                lastRun.elapsedTime = 1000;
                            }
                            percent = Math.round(elapsedTime / lastRun.elapsedTime * 100);
                            elapsedTime = Math.round(elapsedTime / 1000);
                            var command = internals.getActiveCommand(prRuns[0].commands);
                            if (pids.length > 0) {
                                //we have an active run
                                var processes = [];
                                for (var j = 0; j < pids.length; j++) {
                                    var process = {
                                        jobId: jobId,
                                        runId: runId,
                                        repoUrl: prs[i].repoUrl,
                                        pid: pids[j],
                                        number: prs[i].number,
                                        command: command
                                    };
                                    processes.push(process);
                                }
                                config.activePullRequests.push({
                                    jobId: jobId,
                                    runId: runId,
                                    shortId: runId.split('-')[0],
                                    number: prs[i].number,
                                    percent: percent,
                                    elapsedTime: elapsedTime,
                                    processes: processes
                                });
                            } else {
                                // we have a checked run
                                prs[i].runId = runId;
                                prs[i].shortId = runId.split('-')[0];
                                prs[i].finishTime = DateFormat(prRuns[0].finishTime, 'yyyy-mm-dd HH:MM:ss');
                                prs[i].elapsedTime = Math.round((prRuns[0].finishTime - prRuns[0].startTime) / 1000);
                                if (prRuns[0].status === 'succeeded' ) {
                                    prs[i].classColor = 'success';
                                    prs[i].buttonColor = 'btn-success';
                                }
                                if (prRuns[0].status === 'failed' || prRuns[0].status === 'cancelled') {
                                    prs[i].classColor = 'danger';
                                    prs[i].buttonColor = 'btn-danger';
                                }
                                config.checkedPullRequests.push(prs[i]);
                            }
                            getLastRun(i + 1);
                        });
                    }
                });
            } else {
                config.prs = config.newPullRequests.length + config.activePullRequests.length + config.checkedPullRequests.length;
                return cb2(config);
            }
        };
        getLastName(0);
    });
};
