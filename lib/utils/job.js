var Helper = require('../helper');

var internals = {};

module.exports = internals.Job = function(options) {

   this.settings = options;
   internals.Job.settings = options;
   this.getJobsConfig = exports.getJobsConfig;
   this.getJobConfig = exports.getJobConfig;
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
    console.log('reels: ' + reels);
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
    return createConfig.id;
};

exports.getJobConfig = function (id) {

    var job = {};
    var config = {};
    var runs = [];
    var reels = internals.Job.settings.plugins.tacklebox.getReels();
    var reelList = [];
    for (var i = 0; i < reels.length; i++) {
       var reel = internals.Job.settings.plugins.tacklebox.getReel(reels[i]);
       reelList.push(reel);
    }
    if (id) {
        job = internals.Job.settings.plugins.tacklebox.getJob(id);
        var runArray = [];
        if (job.runs.toString() !== '') {
            runArray = job.runs.toString().replace('[','').replace(']','').split(',');
        }
        //for (var i = 0; i < runArray.length; i++) {
        for (var i = runArray.length -1 ; i>=0; i--) {

            var run = internals.Job.settings.plugins.tacklebox.getRun(runArray[i]); 
            var shortId = runArray[i].split('-')[0];
            var helper = new Helper();
            var formatFinish = helper.shortDate(run.finishTime);
            var elapsedTime = helper.shortTime(run.finishTime - run.startTime);

            var runConfig = {
                id: id,
                short_id: shortId,
                status: run.status,
                elapsedTime: elapsedTime,
                finishTime: formatFinish,
                run_id: runArray[i],
            };
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
    }
    else {
        config.post_url = '/gills/job';
    }
    config.view_job = true; 
    config.angler = 'lloyd';
    return config;   
};

exports.updateJob = function (id, payload) {

    var config = {
        id: id,
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

exports.deleteJob = function (id) {

    internals.Job.settings.plugins.tacklebox.deleteJob(id);
};
