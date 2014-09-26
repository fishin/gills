var Helper = require('../helper');

var internals = {};

module.exports = internals.Job = function(options) {

   this.settings = options;
   internals.Job.settings = options;
   this.getJobsConfig = exports.getJobsConfig;
   this.getJobConfig = exports.getJobConfig;
   this.getJobCreateConfig = exports.getJobCreateConfig;
   this.createJob = exports.createJob;
   this.deleteJob = exports.deleteJob;
   this.updateJob = exports.updateJob;
};

exports.getJobsConfig = function () {
   
    var jobs = internals.Job.settings.plugins.tacklebox.getJobs();
    var jobList = [];
    for (var i = 0; i < jobs.length; i++) {
       var job = internals.Job.settings.plugins.tacklebox.getJob(jobs[i]);
       jobList.push(job) 
    }
    var reels = internals.Job.settings.plugins.tacklebox.getReels();
    var reelList = [];
    for (var i = 0; i < reels.length; i++) {
       var reel = internals.Job.settings.plugins.tacklebox.getReel(reels[i]);
       reelList.push(reel);
    }
    //console.log(jobList);
    var config = {
        view_jobs: true,
        angler: 'lloyd',
        jobs: jobList,
        reels: reelList
    };
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

    var job = {};
    var config = {};
    var runs = [];
    var reels = internals.Job.settings.plugins.tacklebox.getReels();
    var reelList = [];
    for (var i = 0; i < reels.length; i++) {
       var reel = internals.Job.settings.plugins.tacklebox.getReel(reels[i]);
       reelList.push(reel);
    }
    config.post_url = '/gills/job';
    config.view_job = true; 
    config.angler = 'lloyd';
    return config;   
};

exports.getJobConfig = function (job_id) {

    var job = {};
    var config = {};
    var runs = [];
    var reels = internals.Job.settings.plugins.tacklebox.getReels();
    var reelList = [];
    for (var i = 0; i < reels.length; i++) {
       var reel = internals.Job.settings.plugins.tacklebox.getReel(reels[i]);
       reelList.push(reel);
    }
    job = internals.Job.settings.plugins.tacklebox.getJob(job_id);
    var runArray = [];
    if (job.runs.toString() !== '') {
        runArray = job.runs.toString().replace('[','').replace(']','').split(',');
    }
    for (var i = runArray.length -1 ; i>=0; i--) {

        var run = internals.Job.settings.plugins.tacklebox.getRun(runArray[i]); 
        var shortId = runArray[i].split('-')[0];
        var helper = new Helper();
        var formatTime;
        var elapsedTime;
        var runConfig = {};
        runConfig = {
            id: job_id,
            short_id: shortId,
            status: run.status,
            run_id: runArray[i],
        };
        if (run.finishTime) {
            formatTime = helper.shortDate(run.finishTime);
            elapsedTime = helper.shortTime(run.finishTime - run.startTime);
            runConfig.finishTime = formatTime;
            runConfig.elapsedTime = elapsedTime;
        }
        else 
        {
            formatTime = helper.shortDate(run.startTime);
            var now = new Date().getTime();
            elapsedTime = helper.shortTime(now - run.startTime);
            runConfig.startTime = formatTime;
            runConfig.elapsedTime = elapsedTime;
        }
        if (run.status === 'succeeded') {
            runConfig.classColor = 'success'; 
        }
        if (run.status === 'failed') {
           runConfig.classColor = 'danger'; 
        }
//            else {
//                runConfig.classColor = 'info'; 
//            }
        runs.push(runConfig);
    }
    config = {
        post_url: '/gills/job/'+job.id,
        view_job: true,
        angler: 'lloyd',
        id: job.id,
        name: job.name,
        description: job.description,
        scm_type: job.scm.type,
        scm_url: job.scm.url,
        scm_branch: job.scm.branch,
        head: job.head,
        body: job.body,
        tail: job.tail,
        runs: runs,
        reels: reelList
    };
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
