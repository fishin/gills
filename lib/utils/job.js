var Common = require('./common');
var Hoek = require('hoek');
var Scheduler = require('../scheduler');

var internals = {};

module.exports = internals.Job = function(options) {

   this.settings = options;
   internals.Job.settings = options;
   var common = new Common(options);
   internals.Job.getCommonConfig = common.getCommonConfig;
   internals.Job.shortDate = common.shortDate;
   this.getJobsConfig = exports.getJobsConfig;
   this.getJobConfig = exports.getJobConfig;
   this.getJobCreateConfig = exports.getJobCreateConfig;
   this.getCommitsConfig = exports.getCommitsConfig;
   this.startJob = exports.startJob;
   this.createJob = exports.createJob;
   this.deleteJob = exports.deleteJob;
   this.deleteWorkspace = exports.deleteWorkspace;
   this.updateJob = exports.updateJob;
};

exports.startJob = function (jobId) {

    var runId = internals.Job.settings.plugins.tacklebox.startJob(jobId);
    return runId;
};

exports.getJobsConfig = function () {
   
    var commonConfig = internals.Job.getCommonConfig();
    var jobs = internals.Job.settings.plugins.tacklebox.getJobs();
    var jobList = [];
    for (var i = 0; i < jobs.length; i++) {
       var job = jobs[i];
       var lastRun = internals.Job.settings.plugins.tacklebox.getRunByName(job.id, 'last');
       job.jobId = job.id;
       if (lastRun) {
           job.runId = lastRun.id;
           if (lastRun.status === 'succeeded' ) {
                job.classColor = 'success'; 
           }
           if (lastRun.status === 'failed') {
               job.classColor = 'danger'; 
           }
       }
       jobList.push(job);
    }
    var config = {
        view_jobs: true,
        jobs: jobList
    };
    Hoek.merge(config,commonConfig);
    return config;
};

exports.createJob = function (pl) {

    var payload = pl;
    var headCommands = [];
    var bodyCommands = [];
    var tailCommands = [];
    for (var key in pl) {
       if (key.match('headCommand')) {
           if (pl[key] !== '') {
               headCommands.push(pl[key]);
           }
           delete pl[key];
       }
       if (key.match('bodyCommand')) {
           if (pl[key] !== '') {
               bodyCommands.push(pl[key]);
           }
           delete pl[key];
       }
       if (key.match('tailCommand')) {
           if (pl[key] !== '') {
               tailCommands.push(pl[key]);
           }
           delete pl[key];
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
    var createConfig = internals.Job.settings.plugins.tacklebox.createJob(config);
    var jobId = createConfig.id;
    var scheduler = new Scheduler(internals.Job.settings);
    if (config.schedule.type === 'cron') {
        scheduler.addSchedule(jobId);
    }
    return createConfig;
};

exports.getJobCreateConfig = function () {

    var commonConfig = internals.Job.getCommonConfig();
    var config = {};
    config.post_url = internals.Job.settings.viewPath + '/job';
    config.view_job = true; 
    Hoek.merge(config,commonConfig);
    return config;   
};

exports.getJobConfig = function (jobId) {

    var commonConfig = internals.Job.getCommonConfig();
    var config = {};
    var finishedRuns = [];
    var activeRuns = [];
    var job = internals.Job.settings.plugins.tacklebox.getJob(jobId);
    var runs = internals.Job.settings.plugins.tacklebox.getRuns(jobId);
    var prs = internals.Job.settings.plugins.tacklebox.getPullRequests(jobId);
    var lastRunId = null;
    var lastCommit;
    var compareCommits;
    var testResult = [];
    if (runs.length > 0) {
        lastRunId = runs[0].id;
        testResult = internals.Job.settings.plugins.tacklebox.getTestResult(jobId, lastRunId, 'lab.json');
        lastCommit = runs[0].commit;
        if (runs.length > 1) {
           if (runs[1].commit) {
              compareCommits = internals.Job.settings.plugins.tacklebox.getCompareCommits(jobId, lastCommit, runs[1].commit);
           }
        }
    }
    for (var i = 0 ; i < runs.length; i++) {

        var runId = runs[i].id;
        var run = internals.Job.settings.plugins.tacklebox.getRun(jobId, runId);
        var shortId = runId.split('-')[0];
        var formatTime;
        var elapsedTime;
        var runConfig = {};
        runConfig = {
            jobId: jobId,
            runId: runId,
            shortId: shortId,
            createTime: run.createTime,
            startTime: run.startTime,
            status: run.status
        };
        var pids = []; 
        if (i === 0) {
            pids = internals.Job.settings.plugins.tacklebox.getRunPids(jobId, runId); 
        }
        if (pids[0]) {
            //console.log(pids);
            // figure out prev run
            var percent = 0;
            var now = new Date().getTime();
            elapsedTime = now - run.startTime;
            if (runs.length !== 1 ) {
               var prevRun = runs[1];
               //if (prevRun.elapsedTime) {
                  percent = Math.round(elapsedTime / prevRun.elapsedTime * 100);
                  //console.log(percent);
               //}
            }
            runConfig.elapsedTime = Math.round(elapsedTime / 1000);
            runConfig.percent = percent;
            var command = internals.getActiveCommand(run.commands);
            runConfig.processes = [];
            for (var j = 0; j < pids.length; j++) {
                var process = {
                   jobId: jobId,
                   runId: runId,
                   pid: pids[j],
                   command: command
                };
                runConfig.processes.push(process);  
            }
            //console.log(run.commands);
            activeRuns.push(runConfig);
        }
        else 
        {
            // need a test
            if (run.finishTime) {
                formatTime = internals.Job.shortDate(run.finishTime);
                elapsedTime = run.finishTime - run.startTime;
                runConfig.finishTime = formatTime;
                runConfig.elapsedTime = Math.round(elapsedTime / 1000);
            }
            else {
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
    }
    if (!job.schedule) {
        job.schedule = {}; 
    }
    if (!job.archive) {
        job.archive = {}; 
    }
    config = {
        post_url: internals.Job.settings.viewPath + '/job/'+job.id,
        view_job: true,
        jobId: job.id,
        runId: lastRunId,
        name: job.name,
        description: job.description,
        head: job.head,
        schedule_type: job.schedule.type,
        cronPattern: job.schedule.pattern,
        archivePattern: job.archive.pattern,
        body: job.body,
        tail: job.tail,
        testResult: testResult,
        activeRuns: activeRuns,
        finishedRuns: finishedRuns,
        lastCommit: lastCommit,
        compareCommits: compareCommits,
        prs: prs
    };
    if (job.scm) {
        config.scm_type = job.scm.type;
        config.scm_url = job.scm.url;
        config.scm_branch = job.scm.branch;
    }
    // convert to form
    for (var i = 0; i < job.head.length; i++) {
        var keyName = 'headCommand' + i;
        config[keyName] = job.head[i];
    }
    for (var i = 0; i < job.body.length; i++) {
        var keyName = 'bodyCommand' + i;
        config[keyName] = job.body[i];
    }
    for (var i = 0; i < job.tail.length; i++) {
        var keyName = 'tailCommand' + i;
        config[keyName] = job.tail[i];
    }
    Hoek.merge(config,commonConfig);
    return config;   
};

exports.updateJob = function (jobId, pl) {

    var payload = pl;
    var headCommands = [];
    var bodyCommands = [];
    var tailCommands = [];
    for (var key in pl) {
       //console.log(key + ':' + pl[key]);
       if (key.match('headCommand')) {
           if (pl[key] !== '') {
               headCommands.push(pl[key]);
           }
           delete pl[key];
       }
       if (key.match('bodyCommand')) {
           if (pl[key] !== '') {
               bodyCommands.push(pl[key]);
           }
           delete pl[key];
       }
       if (key.match('tailCommand')) {
           if (pl[key] !== '') {
               tailCommands.push(pl[key]);
           }
           delete pl[key];
       }
    }
    var config = {
        id: jobId,
        name: payload.name,
        description: payload.description
    };
    if (payload.scm_type === 'git') {
        config.scm = {
            type: payload.scm_type,
            url: payload.scm_url,
            branch: payload.scm_branch
        };
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
    var updateConfig = internals.Job.settings.plugins.tacklebox.updateJob(config.id, config);
    var scheduler = new Scheduler(internals.Job.settings);
    if (config.schedule.type === 'cron') {
        scheduler.removeSchedule(jobId);
        scheduler.addSchedule(jobId);
    } else {
        scheduler.removeSchedule(jobId);
    }
};

exports.deleteJob = function (jobId) {

    internals.Job.settings.plugins.tacklebox.deleteJob(jobId);
};

exports.deleteWorkspace = function (jobId) {

    internals.Job.settings.plugins.tacklebox.deleteWorkspace(jobId);
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
        if (i === end-1 && cmds[i].finishTime) {
            return cmds[end].command;
        }
    }
};

exports.getCommitsConfig = function(jobId) {

    var commonConfig = internals.Job.getCommonConfig();
    var job = internals.Job.settings.plugins.tacklebox.getJob(jobId);
    var commits = internals.Job.settings.plugins.tacklebox.getAllCommits(jobId);
    // add repoUrl
    for (var i = 0; i < commits.length; i++) {
       commits[i].repoUrl = job.scm.url;
    }
    var config = {};
    config = {
        view_commits: true,
        jobId: jobId,
        jobName: job.name,
        commits: commits
    };
    Hoek.merge(config,commonConfig);
    return config;
};
