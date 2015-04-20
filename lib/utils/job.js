var Bait = require('bait');
var DateFormat = require('dateformat');
var Hoek = require('hoek');
var Wreck = require('wreck');
var Common = require('./common');

var internals = {};

module.exports = internals.Job = function(options) {

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

    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/start', function(err, resp, pl) {
 
        //console.log(pl);
        var runId = pl;
        return cb();
    });
};

exports.startPullRequest = function (jobId, number, token, cb) {

    var bait = new Bait(internals.Job.settings.job);
    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number, function(err, resp, pl) {

        //var runId = internals.Job.settings.plugins.tacklebox.startJob(jobId, pr);
        var pr = JSON.parse(pl);
        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number + '/start', function(err, resp, pl) {

            //var runId = bait.startJob(jobId, pr);
            var runId = pl;
            return cb(runId);
        });
    });
};

exports.getJobsConfig = function (cb) {

    internals.Job.getCommonConfig(function (commonConfig) {

        var config = {
           view_jobs: true,
           jobs: []
        };
        Wreck.get(internals.Job.settings.api.url + '/jobs', function(err, resp, pl) {

            var jobs = JSON.parse(pl);
            var getLastName = function getLastRun(i) {

                if (i < jobs.length) {
                    Wreck.get(internals.Job.settings.api.url + '/job/' + jobs[i].id + '/run/byname/last', function(err, resp, pl) {

                        var job = jobs[i];
                        job.jobId = job.id;
                        var lastRun = null;
                        //console.log(pl);
                        if (pl) {
                            lastRun = JSON.parse(pl);
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
    if (payload.scm_type === 'git') {
        config.scm = {
            type: payload.scm_type,
            url: payload.scm_url,
            branch: payload.scm_branch
        };
        if (payload.scm_prs) {
            config.scm.prs = true;
        } else {
            config.scm.prs = false;
        }
        if (payload.scm_runOnCommit) {
            config.scm.runOnCommit = true;
        } else {
            config.scm.runOnCommit = false;
        }
    }
    if (payload.cronPattern !== '') {
        config.schedule = {
            type: payload.schedule_type,
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
    Wreck.post(internals.Job.settings.api.url + '/job', { payload: JSON.stringify(config) }, function(err, resp, pl) {

        var createConfig = JSON.parse(pl);
        var jobId = createConfig.id;
        return cb(createConfig);
    });
};

exports.getJobCreateConfig = function (cb) {

    internals.Job.getCommonConfig(function (commonConfig) {

        var config = {};
        config.post_url = internals.Job.settings.viewPath + '/job';
        config.view_job = true;
        Hoek.merge(config, commonConfig);
        return cb(config);
    });
};

exports.getJobConfig = function (jobId, token, cb) {

    var bait = new Bait(internals.Job.settings.job);
    internals.Job.getCommonConfig(function (commonConfig) {

        var finishedRuns = [];
        var activeRuns = [];
        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId, function(err, resp, pl) {

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
                post_url: internals.Job.settings.viewPath + '/job/' + job.id,
                view_job: true,
                jobId: job.id,
                name: job.name,
                description: job.description,
                head: job.head,
                schedule_type: job.schedule.type,
                cronPattern: job.schedule.pattern,
                archivePattern: job.archive.pattern,
                body: job.body,
                tail: job.tail
            };
            // convert to form
            if (job.head) {
                for (var i = 0; i < job.head.length; i++) {
                    var keyName = 'headCommand' + i;
                    config[keyName] = job.head[i];
                }
            }
            if (job.body) {
                for (var i = 0; i < job.body.length; i++) {
                    var keyName = 'bodyCommand' + i;
                    config[keyName] = job.body[i];
                }
            }
            if (job.tail) {
                for (var i = 0; i < job.tail.length; i++) {
                    var keyName = 'tailCommand' + i;
                    config[keyName] = job.tail[i];
                }
            }
            Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/runs', function(err, resp, pl) {

                var runs = JSON.parse(pl);
                var lastRunId = null;
                var lastCommit;
                if (runs.length > 0) {
                    lastRunId = runs[0].id;
                    config.runId = lastRunId;
                    lastCommit = runs[0].commit;
                    config.lastCommit = lastCommit;
                    if (runs.length > 1) {
                        if (runs[1].commit) {
                            config.compareCommits = bait.getCompareCommits(jobId, lastCommit, runs[1].commit);
                        }
                    }
                }
                for (var i = 0 ; i < runs.length; i++) {
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
                        //console.log('made it');
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
                var pids = [];
                Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/run/' + lastRunId + '/pids', function(err, resp, pl) {

                    pids = JSON.parse(pl);
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
                    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/run/' + lastRunId + '/test/lab.json', function(err, resp, pl) {

                        if (pl) {
                            // returns a status code when invalid lastRunId
                            if (!pl.match('statusCode')) {
                                config.testResult = JSON.parse(pl);
                            }
                        }

                        config.scm_prs = 0;
                        Hoek.merge(config, commonConfig);
                        if (job.scm) {
                            config.scm_type = job.scm.type;
                            config.scm_url = job.scm.url;
                            config.scm_branch = job.scm.branch;
                            if (job.scm.runOnCommit) {
                                config.scm_runOnCommit = 1;
                            }
                            if (job.scm.prs) {
                                config.scm_prs = 1;
                                internals.getPullRequestsConfig(jobId, token, lastRunId, config, function(finalConfig) {

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
    if (payload.scm_type === 'git') {
        config.scm = {
            type: payload.scm_type,
            url: payload.scm_url,
            branch: payload.scm_branch
        };
        if (payload.scm_prs) {
            config.scm.prs = true;
        } else {
            config.scm.prs = false;
        }
        if (payload.scm_runOnCommit) {
            config.scm.runOnCommit = true;
        } else {
            config.scm.runOnCommit = false;
        }
    }
    if (payload.cronPattern !== '') {
        config.schedule = {
            type: payload.schedule_type,
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
    Wreck.post(internals.Job.settings.api.url + '/job/' + jobId, { payload: JSON.stringify(config) }, function(err, resp, pl) {

        var updateConfig = JSON.parse(pl);
        return cb();
    });
};

exports.deleteJob = function (jobId, cb) {

    Wreck.delete(internals.Job.settings.api.url + '/job/' + jobId, function(err, resp, pl) {

        return cb();
    });
};

exports.deleteWorkspace = function (jobId, cb) {


    Wreck.delete(internals.Job.settings.api.url + '/job/' + jobId + '/workspace', function(err, resp, pl) {

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

exports.getCommitsConfig = function(jobId, cb) {

    internals.Job.getCommonConfig(function (commonConfig) {

        Wreck.get(internals.Job.settings.api.url + '/job/' + jobId, function (err, resp, pl) {

            var job = JSON.parse(pl);
            Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/commits', function (err, resp, pl) {

                var commits = JSON.parse(pl);
                // add repoUrl
                for (var i = 0; i < commits.length; i++) {
                    commits[i].repoUrl = job.scm.url;
                }
                var config = {
                    view_commits: true,
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

exports.mergePullRequest = function(jobId, number, token, cb) {

    var bait = new Bait(internals.Job.settings.job);
    //console.log('attempting to merge pull request: ' + number + ' with token: ' + token);
    //internals.Job.settings.plugins.tacklebox.mergePullRequest(jobId, number, token, function(result) {
    bait.mergePullRequest(jobId, number, token, function(result) {

        return cb(result);
    });
};

exports.retryPullRequest = function(jobId, number, cb) {

    console.log('retrying pull request: ' + number);
    Wreck.delete(internals.Job.settings.api.url + '/job/' + jobId + '/pr/' + number, function(err, resp, pl) {

        return cb();
    });
};

internals.getPullRequestsConfig = function(jobId, token, lastRunId, config, cb2) {

//    return cb(config);
    var bait = new Bait(internals.Job.settings.job);
    Wreck.get(internals.Job.settings.api.url + '/job/' + jobId + '/prs', function (err, resp, pl) {

        var prs = [];
        if (pl) {
            prs = JSON.parse(pl);
        }
        config.newPullRequests = [];
        config.activePullRequests = [];
        config.checkedPullRequests = [];
        for (var i = 0; i < prs.length; i++) {
            prs[i].jobId = jobId;
            // initialize 3 states of the pull request
            //var prRuns = internals.Job.settings.plugins.tacklebox.getRuns(jobId, prs[i]);
            var prRuns = bait.getRuns(jobId, prs[i]);
            if (prRuns.length === 0) {
                // its new
                config.newPullRequests.push(prs[i]);
                if (internals.Job.settings.prs.autoStart) {
                    console.log('starting pr check for: ' + prs[i].number);
                    //internals.Job.settings.plugins.tacklebox.startJob(jobId, prs[i]);
                    bait.startJob(jobId, prs[i]);
                }
            } else {
                //var prRun = internals.Job.settings.plugins.tacklebox.getRun(jobId, prs[i], prRuns[0].id);
                var prRun = bait.getRun(jobId, prs[i], prRuns[0].id);
                // set a default of 1 percent per sec
                var lastRun = { elapsedTime: 1 };
                if (lastRunId) {
                    //lastRun = internals.Job.settings.plugins.tacklebox.getRun(jobId, null, lastRunId);
                    lastRun = bait.getRun(jobId, null, lastRunId);
                }
                var runId = prRun.id;
                //var pids = internals.Job.settings.plugins.tacklebox.getRunPids(jobId, prs[i], runId);
                var pids = bait.getRunPids(jobId, prs[i], runId);
                var percent = 0;
                var now = new Date().getTime();
                var elapsedTime = now - prRun.startTime;
                percent = Math.round(elapsedTime / lastRun.elapsedTime * 100);
                elapsedTime = Math.round(elapsedTime / 1000);
                var command = internals.getActiveCommand(prRun.commands);
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
                    prs[i].runId = prRun.id;
                    prs[i].shortId = runId.split('-')[0];
                    prs[i].finishTime = DateFormat(prRun.finishTime, 'yyyy-mm-dd HH:MM:ss');
                    prs[i].elapsedTime = Math.round((prRun.finishTime - prRun.startTime) / 1000);
                    if (prRun.status === 'succeeded' ) {
                        prs[i].classColor = 'success';
                        prs[i].buttonColor = 'btn-success';
                    }
                    if (prRun.status === 'failed' || prRun.status === 'cancelled') {
                        prs[i].classColor = 'danger';
                        prs[i].buttonColor = 'btn-danger';
                    }
                    config.checkedPullRequests.push(prs[i]);
                }
            }
        }
        config.prs = config.newPullRequests.length + config.activePullRequests.length + config.checkedPullRequests.length;
        return cb2(config);
    });
};
