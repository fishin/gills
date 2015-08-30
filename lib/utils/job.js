var DateFormat = require('dateformat');
var Hoek = require('hoek');
var Wreck = require('wreck');

var internals = {};

module.exports = internals.Job = function (options) {

    this.settings = options;
    internals.Job.settings = options;
    this.getJobsConfig = exports.getJobsConfig;
    this.getJobConfig = exports.getJobConfig;
    this.getJobCreateConfig = exports.getJobCreateConfig;
    this.getCommitsConfig = exports.getCommitsConfig;
    this.startPullRequest = exports.startPullRequest;
    this.createJob = exports.createJob;
    this.deleteJob = exports.deleteJob;
    this.deleteWorkspace = exports.deleteWorkspace;
    this.updateJob = exports.updateJob;
    this.mergePullRequest = exports.mergePullRequest;
    this.retryPullRequest = exports.retryPullRequest;
};

exports.startPullRequest = function (jobId, number, cb) {

    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number, { json: true }, function (err, resp, pl) {

        var pr = pl;
        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number + '/start', function (err2, resp2, pl2) {

            var runId = pl2;
            return cb(runId);
        });
    });
};

exports.getJobsConfig = function (cb) {

    internals.Job.settings.Utils.Common.getCommonConfig(function (commonConfig) {

        var config = {
            viewJobs: true,
            jobs: []
        };
        Wreck.get(internals.Job.settings.api.url + '/jobs', { json: true }, function (err, resp, pl) {

            var jobs = pl;
            var getLastName = function getLastRun (i) {

                if (i < jobs.length) {
                    Wreck.get(internals.Job.settings.api.url + '/job/' + jobs[i].id + '/run/byname/last', { json: true }, function (err2, resp2, pl2) {

                        var job = jobs[i];
                        job.jobId = job.id;
                        job.shortJobId = job.id.split('-')[0];
                        var lastRun = null;
                        if (pl2 !== null && !pl2.statusCode) {
                            lastRun = pl2;
                            job.runId = lastRun.id;
                            job.finishTime = DateFormat(lastRun.finishTime, 'yyyy-mm-dd HH:MM:ss');
                            job.shortRunId = lastRun.id.split('-')[0];
                            if (lastRun.status === 'succeeded' || lastRun.status === 'fixed') {
                                job.classColor = 'success';
                            }
                            if (lastRun.status === 'failed') {
                                job.classColor = 'danger';
                            }
                        }
                        Wreck.get(internals.Job.settings.api.url + '/job/' + job.jobId + '/run/' + job.runId + '/test/test.lab', { json: true }, function (err3, resp3, pl3) {

                            var testFile = null;
                            if (pl3 !== null && !pl3.statusCode) {
                                testFile = pl3;
                            }
                            var totalTests = 0;
                            var failedTests = 0;
                            var succeededTests = 0;
                            if (testFile && testFile.tests) {
                                for (var key in testFile.tests) {
                                    for (var j = 0; j < testFile.tests[key].length; j++) {
                                        totalTests++;
                                        if (!testFile.tests[key][j].err) {
                                            succeededTests++;
                                        } else {
                                            failedTests++;
                                        }
                                    }
                                }
                                job.failedTests = failedTests + ' / ' + totalTests + ' (' + Math.round((failedTests / totalTests) * 100) + '%)';
                                job.succeededTests = succeededTests + ' / ' + totalTests + ' (' + Math.round((succeededTests / totalTests) * 100) + '%)';
                            }
                            config.jobs.push(job);
                            getLastName(i + 1);
                        });
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

internals.convertFormToJson = function (payload) {

    var headCommands = [];
    var bodyCommands = [];
    var tailCommands = [];
    var bodyCommandTypes = ['clean', 'install', 'test'];
    for (var key in payload) {
        if (key.match('headCommand')) {
            if (payload[key] !== '') {
                headCommands.push(payload[key]);
            }
            delete payload[key];
        }
        if (key.match('cleanCommand')) {
            bodyCommands[0] = payload[key];
            delete payload[key];
        }
        if (key.match('installCommand')) {
            bodyCommands[1] = payload[key];
            delete payload[key];
        }
        if (key.match('testCommand')) {
            bodyCommands[2] = payload[key];
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
//        targets: 'global',
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
    } else {
        config.scm = {
            type: payload.scmType,
            url: payload.scmUrl,
            branch: payload.scmBranch
        };
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
    config.archive = {
        type: 'none'
    };
    if (payload.archivePattern !== '') {
        config.archive.pattern = payload.archivePattern;
    }
    if (payload.archiveType !== 'none') {
        config.archive.type = payload.archiveType;
        config.archive.maxNumber = payload.archiveMaxNumber;
    }
    config.notify = {
        type: 'none'
    };
    if (payload.notifyType === 'email') {
        config.notify = {
            type: payload.notifyType,
            to: payload.notifyTo,
            subject: payload.notifySubject,
            message: payload.notifyMessage,
            statuses: []
        };
    }
    if (payload.notifyStatusSucceeded && payload.notifyType !== 'none') {
        config.notify.statuses.push('succeeded');
    }
    if (payload.notifyStatusFailed && payload.notifyType !== 'none') {
        config.notify.statuses.push('failed');
    }
    if (payload.notifyStatusFixed && payload.notifyType !== 'none') {
        config.notify.statuses.push('fixed');
    }
    if (payload.notifyStatusCancelled && payload.notifyType !== 'none') {
        config.notify.statuses.push('cancelled');
    }
    return config;
};

exports.createJob = function (payload, cb) {

    var config = internals.convertFormToJson(payload);
    Wreck.post(internals.Job.settings.api.url + '/job', { payload: JSON.stringify(config), json: true }, function (err, resp, pl) {

        var createConfig = pl;
        var jobId = createConfig.id;
        return cb(createConfig);
    });
};

exports.getJobCreateConfig = function (cb) {

    internals.Job.settings.Utils.Common.getCommonConfig(function (commonConfig) {

        var config = {
            url: internals.Job.settings.viewPath + '/job',
            method: 'post',
            viewJob: true,
            scheduleType: 'none',
            archiveType: 'none',
            notifyType: 'none',
            notifySubject: '[{tag}] {type} {name} {status}',
            notifyMessage: internals.Job.settings.server.root.info.uri + internals.Job.settings.viewPath + '/{relativeUrl}',
            notifyStatusFailed: true,
            notifyStatusFixed: true
        };
        Hoek.merge(config, commonConfig);
        return cb(config);
    });
};

exports.getJobConfig = function (jobId, cb) {

    internals.Job.settings.Utils.Common.getCommonConfig(function (commonConfig) {

        var finishedRuns = [];
        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId, { json: 'force' }, function (err, resp, pl) {

            //console.log(pl);
            var job = {};
            if (pl !== null && !pl.statusCode) {
                job = pl;
            }
            if (!job.schedule) {
                job.schedule = {};
            }
            if (!job.archive) {
                job.archive = {};
            }
            if (!job.notify) {
                job.notify = {};
            }
            if (!job.scm) {
                job.scm = {
                    type: 'none'
                };
            }
            var config = {
                url: internals.Job.settings.viewPath + '/job/' + job.id,
                method: 'post',
                viewJob: true,
                jobId: job.id,
                name: job.name,
                description: job.description,
                targets: job.targets,
                head: job.head,
                scheduleType: job.schedule.type,
                cronPattern: job.schedule.pattern,
                archiveType: job.archive.type,
                archiveMaxNumber: job.archive.maxNumber,
                archivePattern: job.archive.pattern,
                notifyType: job.notify.type,
                notifyTo: job.notify.to,
                notifySubject: job.notify.subject,
                notifyMessage: job.notify.message,
                tail: job.tail
            };
            if (job.notify.statuses) {
                for (var i = 0; i < job.notify.statuses.length; i++) {
                    if (job.notify.statuses[i] === 'failed') {
                        config.notifyStatusFailed = true;
                    }
                    if (job.notify.statuses[i] === 'fixed') {
                        config.notifyStatusFixed = true;
                    }
                    if (job.notify.statuses[i] === 'cancelled') {
                        config.notifyStatusCancelled = true;
                    }
                    if (job.notify.statuses[i] === 'succeeded') {
                        config.notifyStatusSucceeded = true;
                    }
                }
            }
            // convert to form
            if (job.head) {
                for (var j = 0; j < job.head.length; j++) {
                    var keyName1 = 'headCommand' + j;
                    config[keyName1] = job.head[j];
                }
            }
            if (job.body) {
                config.cleanCommand = job.body[0];
                config.installCommand = job.body[1];
                config.testCommand = job.body[2];
            }
            if (job.tail) {
                for (var l = 0; l < job.tail.length; l++) {
                    var keyName3 = 'tailCommand' + l;
                    config[keyName3] = job.tail[l];
                }
            }
            Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/runs', { json: true }, function (err2, resp2, pl2) {

                var runs = pl2;
                for (var m = 0; m < runs.length; m++) {
                    var runId = runs[m].id;
                    var run = runs[m];
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
                    if (run.status === 'succeeded' || run.status === 'fixed') {
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
                    config.lastStatus = runs[0].status;
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
                Wreck.post(internals.Job.settings.api.url + '/job/' + jobId + '/commits/compare', { payload: JSON.stringify(comparePayload), json: true }, function (err3, resp3, pl3) {

                    config.compareCommits = pl3;
                    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/run/' + lastRunId + '/pids', { json: true }, function (err4, resp4, pl4) {

                        var pids = pl4;
                        if (pids[0]) {
                            // remove the finished Runs first one as it was really active
                            finishedRuns.splice(0, 1);
                        }
                        config.finishedRuns = finishedRuns;
                        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/run/' + lastRunId + '/test/test.lab', { json: true }, function (err5, resp5, pl5) {

                            // returns a status code when invalid lastRunId
                            //console.log(pl5);
                            if (pl5 !== null && !pl5.statusCode) {
                                config.testResult = pl5;
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
                                    internals.getPullRequestsConfig(jobId, runs[0], config, function (finalConfig) {

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

    var config = internals.convertFormToJson(payload);
    Wreck.put(internals.Job.settings.api.url + '/job/' + jobId, { payload: JSON.stringify(config), json: 'force' }, function (err, resp, pl) {

        if (pl.statusCode) {
            console.log(pl);
        }
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

exports.getCommitsConfig = function (jobId, cb) {

    internals.Job.settings.Utils.Common.getCommonConfig(function (commonConfig) {

        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId, { json: true }, function (err, resp, pl) {

            var job = pl;
            Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/commits', { json: true },  function (err2, resp2, pl2) {

                var commits = pl2;
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
        },
        json: true
    };
    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number + '/merge', options, function (err, resp, pl) {

        var result = pl;
        return cb(result);
    });
};

exports.retryPullRequest = function (jobId, number, cb) {

    console.log('retrying pull request: ' + number);
    Wreck.delete(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number, function (err, resp, pl) {

        return cb();
    });
};

internals.getPullRequestsConfig = function (jobId, lastRun, config, cb2) {

    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/prs', { json: 'force' }, function (err, resp, pl) {

        var prs = [];
        if (pl !== null && !pl.statusCode) {
            prs = pl;
        }
        config.newPullRequests = [];
        config.checkedPullRequests = [];
        config.openprs = prs.length;
        var getLastName = function getLastRun (i) {

            if (i < prs.length) {
                prs[i].jobId = jobId;
                // initialize 3 states of the pull request
                Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + prs[i].number + '/runs', { json: 'force' }, function (err2, resp2, pl2) {

                    var prRuns = [];
                    if (prRuns !== null && !pl2.statusCode) {
                        prRuns = pl2;
                    }
                    if (prRuns.length === 0) {
                        // its new
                        config.newPullRequests.push(prs[i]);
                        if (internals.Job.settings.prs.autoStart) {
                            console.log('starting pr check for: ' + prs[i].number);
                            Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + prs[i].number + '/start', function (err3, resp3, pl3) {

                                getLastRun(i + 1);
                            });
                        } else {
                            getLastRun(i + 1);
                        }
                    } else {
                        var runId = prRuns[0].id;
                        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + prs[i].number + '/run/' + runId + '/pids', { json: 'force' }, function (err4, resp4, pl4) {

                            var pids = [];
                            if (pl4 !== null && !pl4.statusCode) {
                                pids = pl4;
                            }
                            if (pids.length === 0) {
                                // we have a checked run
                                prs[i].runId = runId;
                                prs[i].shortId = runId.split('-')[0];
                                prs[i].finishTime = DateFormat(prRuns[0].finishTime, 'yyyy-mm-dd HH:MM:ss');
                                prs[i].elapsedTime = Math.round((prRuns[0].finishTime - prRuns[0].startTime) / 1000);
                                if (prRuns[0].status === 'succeeded' || prRuns[0].status === 'fixed') {
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
                config.prs = config.newPullRequests.length + config.checkedPullRequests.length;
                //config.prs = config.newPullRequests.length + config.activePullRequests.length + config.checkedPullRequests.length;
                return cb2(config);
            }
        };
        getLastName(0);
    });
};
