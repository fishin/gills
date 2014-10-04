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
       job.job_id = job.id;
       if (lastRun) {
           job.run_id = lastRun.id;
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

exports.createJob = function (payload) {

    var config = {
        name: payload.name,
        description: payload.description,
        scm: {
            type: payload.scm_type,
            url: payload.scm_url,
            branch: payload.scm_branch
        },
        head: payload.head,
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

exports.getJobConfig = function (job_id) {

    var commonConfig = internals.Job.getCommonConfig();
    //console.log(commonConfig);
    var config = {};
    var finishedRuns = [];
    var activeRuns = [];
    var job = internals.Job.settings.plugins.tacklebox.getJob(job_id);
    var runs = internals.Job.settings.plugins.tacklebox.getRuns(job_id);
    for (var i = 0 ; i < runs.length; i++) {

        var run_id = runs[i].id;
        var run = runs[i];
        var shortId = run_id.split('-')[0];
        var formatTime;
        var elapsedTime;
        var runConfig = {};
        runConfig = {
            job_id: job_id,
            run_id: run_id,
            short_id: shortId,
            createTime: run.createTime,
            startTime: run.startTime,
            status: run.status
        };
        var pids = internals.Job.settings.plugins.tacklebox.getRunPids(job_id, run_id); 
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
                   job_id: job_id,
                   run_id: run_id,
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
        scm_type: job.scm.type,
        scm_url: job.scm.url,
        scm_branch: job.scm.branch,
        head: job.head,
        body: job.body,
        tail: job.tail,
        activeRuns: activeRuns,
        finishedRuns: finishedRuns,
    };
    Hoek.merge(config,commonConfig);
    return config;   
};

exports.updateJob = function (job_id, payload) {

    var config = {
        id: job_id,
        name: payload.name,
        description: payload.description,
        scm: {
            type: payload.scm_type,
            url: payload.scm_url,
            branch: payload.scm_branch
        },
        head: payload.head,
        body: payload.body,
        tail: payload.tail
    };
    var updateConfig = internals.Job.settings.plugins.tacklebox.updateJob(config.id, config);
};

exports.deleteJob = function (job_id) {

    internals.Job.settings.plugins.tacklebox.deleteJob(job_id);
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
