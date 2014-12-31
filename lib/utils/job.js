var Common = require('./common');
var Hoek = require('hoek');

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
   this.createJob = exports.createJob;
   this.deleteJob = exports.deleteJob;
   this.deleteWorkspace = exports.deleteWorkspace;
   this.updateJob = exports.updateJob;
};

exports.getJobsConfig = function () {
   
    var commonConfig = internals.Job.getCommonConfig();
    //console.log(commonConfig);
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
    //console.log(jobList);
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
       //console.log(key + ':' + pl[key]);
       if (key.match('headCommand') && pl[key] !== '') {
           headCommands.push(pl[key]);
           delete pl[key];
       }
       if (key.match('bodyCommand') && pl[key] !== '') {
           bodyCommands.push(pl[key]);
           delete pl[key];
       }
       if (key.match('tailCommand') && pl[key] !== '') {
           tailCommands.push(pl[key]);
           delete pl[key];
       }
    }
    payload.head = headCommands;
    payload.body = bodyCommands;
    payload.tail = tailCommands;
    //console.log(payload);
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
    //console.log(config);
    var createConfig = internals.Job.settings.plugins.tacklebox.createJob(config);
    return createConfig;
};

exports.getJobCreateConfig = function () {

    var commonConfig = internals.Job.getCommonConfig();
    //console.log(commonConfig);
    var config = {};
    config.post_url = '/gills/job';
    config.view_job = true; 
    Hoek.merge(config,commonConfig);
    return config;   
};

exports.getJobConfig = function (jobId) {

    var commonConfig = internals.Job.getCommonConfig();
    //console.log(commonConfig);
    var config = {};
    var finishedRuns = [];
    var activeRuns = [];
    var job = internals.Job.settings.plugins.tacklebox.getJob(jobId);
    var runs = internals.Job.settings.plugins.tacklebox.getRuns(jobId);
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
        var pids = internals.Job.settings.plugins.tacklebox.getRunPids(jobId, runId); 
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
            //if (run.finishTime) {
                formatTime = internals.Job.shortDate(run.finishTime);
                elapsedTime = run.finishTime - run.startTime;
                runConfig.finishTime = formatTime;
                runConfig.elapsedTime = Math.round(elapsedTime / 1000);
            //}
            //else {
            //    console.log('made it');
            //    runConfig.finishTime = 'died';
            //    runConfig.classColor = 'info';
            //}
            if (run.status === 'succeeded' ) {
                runConfig.classColor = 'success'; 
            }
            if (run.status === 'failed') {
               runConfig.classColor = 'danger'; 
            }
            finishedRuns.push(runConfig);
        }
    }
    config = {
        post_url: '/gills/job/'+job.id,
        view_job: true,
        id: job.id,
        name: job.name,
        description: job.description,
        head: job.head,
        scm_type: job.scm.type,
        scm_url: job.scm.url,
        scm_branch: job.scm.branch,
        body: job.body,
        tail: job.tail,
        activeRuns: activeRuns,
        finishedRuns: finishedRuns,
    };
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
       if (key.match('headCommand') && pl[key] !== '') {
           headCommands.push(pl[key]);
           delete pl[key];
       }
       if (key.match('bodyCommand') && pl[key] !== '') {
           bodyCommands.push(pl[key]);
           delete pl[key];
       }
       if (key.match('tailCommand') && pl[key] !== '') {
           tailCommands.push(pl[key]);
           delete pl[key];
       }
    }
    if (headCommands.length > 0 ) {
        payload.head = headCommands;
    }
    if (bodyCommands.length > 0 ) {
        payload.body = bodyCommands;
    }
    if (tailCommands.length > 0 ) {
        payload.tail = tailCommands;
    }
    //console.log(payload);
    var config = {
        id: jobId,
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
