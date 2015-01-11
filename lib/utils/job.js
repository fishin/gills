var Common = require('./common');
var Hoek = require('hoek');
//var Scheduler = require('../scheduler');

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
   this.createJob = exports.createJob;
   this.deleteJob = exports.deleteJob;
   this.deleteWorkspace = exports.deleteWorkspace;
   this.updateJob = exports.updateJob;
};

exports.getJobsConfig = function () {
   
    var commonConfig = internals.Job.getCommonConfig();
    var jobs = internals.Job.settings.plugins.tacklebox.getJobs();
    var jobList = [];
    for (var i = 0; i < jobs.length; i++) {
       var job = jobs[i];
       var lastRun = internals.Job.settings.plugins.tacklebox.getRunByLink(job.id, 'last');
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
        scm: {
            type: payload.scm_type,
            url: payload.scm_url,
            branch: payload.scm_branch
        },
        body: payload.body,
        tail: payload.tail
    };
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
    var createConfig = internals.Job.settings.plugins.tacklebox.createJob(config);
    return createConfig;
};

exports.getJobCreateConfig = function () {

    var commonConfig = internals.Job.getCommonConfig();
    var config = {};
    config.post_url = '/gills/job';
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
    var testResults = internals.getLastTestResult(jobId, 'lab.json');
    var lastRunId = null;
    var lastCommit;
    if (runs.length > 0) {
        lastRunId = runs[0].id;
        lastCommit = internals.getCommits(jobId)[0].commit;
    }
    for (var i = 0 ; i < runs.length; i++) {

        var runId = runs[i].id;
        var run = runs[i];
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
    config = {
        post_url: '/gills/job/'+job.id,
        view_job: true,
        id: job.id,
        lastRunId: lastRunId,
        name: job.name,
        description: job.description,
        head: job.head,
        scm_type: job.scm.type,
        scm_url: job.scm.url,
        scm_branch: job.scm.branch,
        schedule_type: job.schedule.type,
        cronPattern: job.schedule.pattern,
        body: job.body,
        tail: job.tail,
        testResults: testResults,
        activeRuns: activeRuns,
        finishedRuns: finishedRuns,
        lastCommit: lastCommit
    };
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
        description: payload.description,
        scm: {
            type: payload.scm_type,
            url: payload.scm_url,
            branch: payload.scm_branch
        }
    };
    if (payload.cronPattern !== '') {
        //var scheduler = new Scheduler();
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
    config.head = headCommands;
    config.body = bodyCommands;
    config.tail = tailCommands;
    var updateConfig = internals.Job.settings.plugins.tacklebox.updateJob(config.id, config);
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

internals.getLastTestResult = function (jobId, artifact) {

    var contents = internals.Job.settings.plugins.tacklebox.getWorkspaceArtifact(jobId, artifact);
    var result = {};
    if (contents) {
        var tests = JSON.parse(contents);
        result.totalTests = 0;
        result.coveragePercent = Math.round(tests.coverage.percent * 100) / 100;
        result.coverage = tests.coverage;
        result.totalDuration = tests.duration;
        result.totalLeaks = tests.leaks.length;
        result.tests = tests.tests;
        for (key in tests.tests) {
            result.totalTests += tests.tests[key].length; 
        }
        //console.log('totalTests: ' + result.totalTests);
        //console.log(JSON.stringify(tests, null, 4));
        return result;
    } else {
        return null;
    }
};

exports.getCommitsConfig = function(jobId) {

    var commonConfig = internals.Job.getCommonConfig();
    var job = internals.Job.settings.plugins.tacklebox.getJob(jobId);
    var gitLog = internals.getCommits(jobId);
    var config = {};
    config = {
        view_commits: true,
        jobId: jobId,
        jobName: job.name,
        gitLog: gitLog
    };
    Hoek.merge(config,commonConfig);
    return config;
};

internals.getCommits = function(jobId) {

   var lastRun = internals.Job.settings.plugins.tacklebox.getRunByLink(jobId, 'last');
   var gitLog = [];
   var gitLogBuffer = '';

   for (var i = 0; i < lastRun.commands.length; i++) {
       if (lastRun.commands[i].command === 'git log') {
           gitLogBuffer = lastRun.commands[i].stdout;
       } 
   } 

   var history = gitLogBuffer.split('\n');
   var gitObj = {};
   for (var i = 0; i < history.length; i++) {
       //console.log(i + ' ' + history[i]);
       if (history[i].match('^commit ')) {
           //console.log('matched: ' + history[i]);
           if (i !== 0) {
               gitLog.push(gitObj);
               gitObj = {};
           }
           gitObj.commit = history[i].split('commit ')[1];
       }
       if (history[i].match('^Author:')) {
           //console.log('matched: ' + history[i]);
           gitObj.author = history[i].split('Author:')[1].trim();
       }
       if (history[i].match('^Date:')) {
           //console.log('matched: ' + history[i]);
           gitObj.date = history[i].split('Date:')[1].trim();
       }
       if (history[i].match('^ ')) {
           //console.log('matched: ' + history[i]);
           gitObj.message = history[i].trim();
       }
   }
   gitLog.push(gitObj);
   //console.log(gitLog);
   return gitLog;
};
