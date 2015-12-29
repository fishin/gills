'use strict';

const DateFormat = require('dateformat');
const Hoek = require('hoek');
const Wreck = require('wreck');

const internals = {};

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

    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number, { json: true }, (err, resp, pl) => {

        Hoek.assert(!err, err);
        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number + '/start', (err2, resp2, pl2) => {

            Hoek.assert(!err2, err2);
            const runId = pl2;
            return cb(runId);
        });
    });
};

exports.getJobsConfig = function (cb) {

    Wreck.get(internals.Job.settings.api.url + '/jobs/stats', { json: true }, (err, resp, pl) => {

        Hoek.assert(!err, err);
        const jobs = pl;
        for (let i = 0; i < jobs.length; ++i) {
            const job = jobs[i];
            job.jobId = job.id;
            job.shortJobId = job.id.split('-')[0];
            if (job.lastRun) {
                job.runId = job.lastRun.id;
                job.finishTime = DateFormat(job.lastRun.finishTime, 'yyyy-mm-dd HH:MM:ss');
                job.shortRunId = job.lastRun.id.split('-')[0];
                if (job.lastRun.status === 'succeeded' || job.lastRun.status === 'fixed') {
                    job.classColor = 'success';
                }
                if (job.lastRun.status === 'failed') {
                    job.classColor = 'danger';
                }
                if (job.lastRun.status === 'cancelled') {
                    job.classColor = 'info';
                }
                let totalTests = 0;
                let failedTests = 0;
                let succeededTests = 0;
                if (job.lastRun.testFile && job.lastRun.testFile.tests) {
                    for (const key in job.lastRun.testFile.tests) {
                        for (let j = 0; j < job.lastRun.testFile.tests[key].length; ++j) {
                            totalTests++;
                            if (!job.lastRun.testFile.tests[key][j].err) {
                                succeededTests++;
                            }
                            else {
                                failedTests++;
                            }
                        }
                    }
                    const failedPercent = failedTests / totalTests * 100;
                    const succeededPercent = succeededTests / totalTests * 100;
                    job.failedTests = failedTests + ' / ' + totalTests + ' (' + Math.round(failedPercent * 100) / 100 + '%)';
                    job.succeededTests = succeededTests + ' / ' + totalTests + ' (' + Math.round(succeededPercent * 100) / 100 + '%)';
                    if (job.lastRun.testFile.coveragePercent) {
                        job.coveragePercent = job.lastRun.testFile.coveragePercent + '%';
                    }
                    else {
                        job.coveragePercent = 'N/A';
                    }
                    if (job.lastRun.testFile.lint) {
                        job.lintErrors = 0;
                        for (let j = 0; j < job.lastRun.testFile.lint.length; ++j) {
                            job.lintErrors += job.lastRun.testFile.lint[j].errors.length;
                        }
                    }
                    else {
                        job.lintErrors = 'N/A';
                    }
                }
            }
        }
        const config = {
            viewJobs: true,
            jobs: jobs
        };
        internals.Job.settings.Utils.Common.getCommonConfig((commonConfig) => {

            Hoek.merge(config, commonConfig);
            return cb(config);
        });
    });
};

internals.convertJSONToForm = function (job) {

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
    const config = {
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
        for (let i = 0; i < job.notify.statuses.length; ++i) {
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
    if (job.head) {
        for (let i = 0; i < job.head.length; ++i) {
            const keyName1 = 'headCommand' + i;
            config[keyName1] = job.head[i];
        }
    }
    if (job.body) {
        config.cleanCommand = job.body[0];
        config.installCommand = job.body[1];
        config.testCommand = job.body[2];
    }
    if (job.tail) {
        for (let i = 0; i < job.tail.length; ++i) {
            const keyName3 = 'tailCommand' + i;
            config[keyName3] = job.tail[i];
        }
    }
    return config;
};

internals.convertFormToJSON = function (payload) {

    const headCommands = [];
    const bodyCommands = [];
    const tailCommands = [];
    for (const key in payload) {
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
    const config = {
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
        }
        else {
            config.scm.prs = false;
        }
        if (payload.scmRunOnCommit) {
            config.scm.runOnCommit = true;
        }
        else {
            config.scm.runOnCommit = false;
        }
    }
    else {
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
    }
    else {
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

    const config = internals.convertFormToJSON(payload);
    Wreck.post(internals.Job.settings.api.url + '/job', { payload: JSON.stringify(config), json: true }, (err, resp, pl) => {

        Hoek.assert(!err, err);
        const createConfig = pl;
        return cb(createConfig);
    });
};

exports.getJobCreateConfig = function (cb) {

    const config = {
        url: internals.Job.settings.viewPath + '/job',
        method: 'post',
        viewJob: true,
        scheduleType: 'none',
        archiveType: 'none',
        notifyType: 'none',
        notifySubject: '[{tag}] [{type}] {name} {status}',
        notifyMessage: internals.Job.settings.info.uri + internals.Job.settings.viewPath + '/{relativeUrl}',
        notifyStatusFailed: true,
        notifyStatusFixed: true
    };
    internals.Job.settings.Utils.Common.getCommonConfig((commonConfig) => {

        Hoek.merge(config, commonConfig);
        return cb(config);
    });
};

exports.getJobConfig = function (jobId, cb) {

    internals.Job.settings.Utils.Common.getCommonConfig((commonConfig) => {

        const finishedRuns = [];
        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId, { json: 'force' }, (err, resp, pl) => {

            Hoek.assert(!err, err);
            //console.log(pl);
            let job = {};
            if (pl !== null && !pl.statusCode) {
                job = pl;
            }
            const config = internals.convertJSONToForm(job);
            Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/runs', { json: true }, (err2, resp2, pl2) => {

                Hoek.assert(!err2, err2);
                const runs = pl2;
                for (let i = 0; i < runs.length; ++i) {
                    const runId = runs[i].id;
                    const run = runs[i];
                    const shortId = runId.split('-')[0];
                    let formatTime;
                    let elapsedTime;
                    const runConfig = {
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
                        runConfig.elapsedTime = internals.Job.settings.displayTimeString(elapsedTime);

                    }
                    else {
                        runConfig.finishTime = 'died';
                        runConfig.classColor = 'info';
                    }
                    if (run.status === 'succeeded' || run.status === 'fixed') {
                        runConfig.classColor = 'success';
                    }
                    if (run.status === 'failed') {
                        runConfig.classColor = 'danger';
                    }
                    if (run.status === 'cancelled') {
                        runConfig.classColor = 'info';
                    }
                    finishedRuns.push(runConfig);
                }
                let lastRunId = null;
                let lastCommit;
                const comparePayload = {};
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
                Wreck.post(internals.Job.settings.api.url + '/job/' + jobId + '/commits/compare', { payload: JSON.stringify(comparePayload), json: true }, (err3, resp3, pl3) => {

                    Hoek.assert(!err3, err3);
                    config.compareCommits = pl3;
                    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/run/' + lastRunId + '/pids', { json: true }, (err4, resp4, pl4) => {

                        Hoek.assert(!err4, err4);
                        const pids = pl4;
                        if (pids[0]) {
                            // remove the finished Runs first one as it was really active
                            finishedRuns.splice(0, 1);
                        }
                        config.finishedRuns = finishedRuns;
                        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/run/' + lastRunId + '/test', { json: true }, (err5, resp5, pl5) => {

                            Hoek.assert(!err5, err5);
                            // returns a status code when invalid lastRunId
                            //console.log(pl5);
                            if (pl5 !== null && !pl5.statusCode) {
                                config.testResult = pl5;
                                //config.testResult.totalDuration = Math.round(config.testResult.totalDuration * 100) / 100;
                                config.testResult.totalDuration = internals.Job.settings.displayTimeString(config.testResult.totalDuration);
                                if (config.testResult.lint) {
                                    config.lintErrors = 0;
                                    for (let i = 0; i < config.testResult.lint.length; ++i) {
                                        config.lintErrors += config.testResult.lint[i].errors.length;
                                    }
                                }

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
                                    internals.getPullRequestsConfig(jobId, config, (finalConfig) => {

                                        return cb(finalConfig);
                                    });
                                }
                                else {
                                    return cb(config);
                                }
                            }
                            else {
                                return cb(config);
                            }
                        });
                    });
                });
            });
        });
    });
};

internals.getPullRequestsConfig = function (jobId, config, cb2) {

    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/prs', { json: 'force' }, (err1, resp, pl) => {

        // TODO: this fails
        // err returns [SyntaxError: Unexpected string]
        // and Hoek can not deal
        //console.log(err1);
        //Hoek.assert(!err1, err1);
        let prs = [];
        if (pl !== null && !pl.statusCode) {
            prs = pl;
        }
        config.newPullRequests = [];
        config.checkedPullRequests = [];
        config.openprs = prs.length;
        internals.getFullPullRequests(0, jobId, prs, { newPullRequests: [], checkedPullRequests: [] }, (fullPullRequests) => {

            config.newPullRequests = fullPullRequests.newPullRequests;
            config.checkedPullRequests = fullPullRequests.checkedPullRequests;
            config.prs = fullPullRequests.newPullRequests.length + fullPullRequests.checkedPullRequests.length;
            return cb2(config);
        });
    });
};

internals.getFullPullRequests = function (i, jobId, prs, fullPullRequests, gfprcb) {

    if (i < prs.length) {
        prs[i].jobId = jobId;
        // initialize 3 states of the pull request
        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + prs[i].number + '/runs', { json: 'force' }, (err2, resp2, pl2) => {

            //Hoek.assert(!err2, err2);
            let prRuns = [];
            if (prRuns !== null && !pl2.statusCode) {
                prRuns = pl2;
            }
            if (prRuns.length === 0) {
                // its new
                prs[i].shortAuthor = prs[i].remoteUser.substr(0, 7),
                prs[i].shortBranch = prs[i].remoteBranch.substr(0, 7),
                fullPullRequests.newPullRequests.push(prs[i]);
                internals.getFullPullRequests(i + 1, jobId, prs, fullPullRequests, gfprcb);
            }
            else {
                const runId = prRuns[0].id;
                Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + prs[i].number + '/run/' + runId + '/pids', { json: 'force' }, (err4, resp4, pl4) => {

                    //Hoek.assert(!err4, err4);
                    let pids = [];
                    if (pl4 !== null && !pl4.statusCode) {
                        pids = pl4;
                    }
                    if (pids.length === 0) {
                        // we have a checked run
                        prs[i].runId = runId;
                        prs[i].shortId = runId.split('-')[0];
                        prs[i].finishTime = DateFormat(prRuns[0].finishTime, 'yyyy-mm-dd HH:MM:ss');
                        prs[i].elapsedTime = internals.Job.settings.displayTimeString(prRuns[0].finishTime - prRuns[0].startTime);
                        if (prRuns[0].status === 'succeeded' || prRuns[0].status === 'fixed') {
                            prs[i].classColor = 'success';
                            prs[i].buttonColor = 'btn-success';
                        }
                        if (prRuns[0].status === 'failed' || prRuns[0].status === 'cancelled') {
                            prs[i].classColor = 'danger';
                            prs[i].buttonColor = 'btn-danger';
                        }
                        fullPullRequests.checkedPullRequests.push(prs[i]);
                    }
                    internals.getFullPullRequests(i + 1, jobId, prs, fullPullRequests, gfprcb);
                });
            }
        });
    }
    else {
        return gfprcb(fullPullRequests);
    }
};

exports.updateJob = function (jobId, payload, cb) {

    const config = internals.convertFormToJSON(payload);
    Wreck.put(internals.Job.settings.api.url + '/job/' + jobId, { payload: JSON.stringify(config), json: 'force' }, (err, resp, pl) => {

        Hoek.assert(!err, err);
        if (pl.statusCode) {
            console.log(pl);
        }
        return cb();
    });
};

exports.deleteJob = function (jobId, cb) {

    Wreck.delete(internals.Job.settings.api.url + '/job/' + jobId, (err, resp, pl) => {

        Hoek.assert(!err, err);
        return cb();
    });
};

exports.deleteWorkspace = function (jobId, cb) {


    Wreck.delete(internals.Job.settings.api.url + '/job/' + jobId + '/workspace', (err, resp, pl) => {

        Hoek.assert(!err, err);
        return cb();
    });
};

exports.getCommitsConfig = function (jobId, cb) {

    internals.Job.settings.Utils.Common.getCommonConfig((commonConfig) => {

        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId, { json: true }, (err, resp, pl) => {

            Hoek.assert(!err, err);
            const job = pl;
            Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/commits', { json: true },  (err2, resp2, pl2) => {

                Hoek.assert(!err2, err2);
                const commits = pl2;
                // add repoUrl
                for (let i = 0; i < commits.length; ++i) {
                    commits[i].repoUrl = job.scm.url;
                }
                const config = {
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
    const options = {
        headers: {
            githubtoken: token
        },
        json: true
    };
    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number + '/merge', options, (err, resp, pl) => {

        Hoek.assert(!err, err);
        const result = pl;
        return cb(result);
    });
};

exports.retryPullRequest = function (jobId, number, cb) {

    console.log('retrying pull request: ' + number);
    Wreck.delete(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number, (err, resp, pl) => {

        Hoek.assert(!err, err);
        return cb();
    });
};
