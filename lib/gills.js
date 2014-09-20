var Utils = require('./utils');

var internals = {};

module.exports = internals.Gills = function(options) {

   this.settings = options;
   internals.Gills.settings = options;
   this.redirectHome = exports.redirectHome;
   this.getJobs = exports.getJobs;
   this.getJob = exports.getJob;
   this.createJob = exports.createJob;
   this.deleteJob = exports.deleteJob;
   this.updateJob = exports.updateJob;
   this.runJob = exports.runJob;
   this.getRun = exports.getRun;
   this.deleteRun = exports.deleteRun;
/*
   this.createReel = exports.createReel;
   this.deleteReel = exports.deleteReel;
*/
   this.getReel = exports.getReel;
};

exports.redirectHome = function (request, reply) {

    reply.redirect('/gills/jobs');
};

exports.getJobs = function (request, reply) {
    
    var jobs = internals.Gills.settings.plugins.tacklebox.getJobs();
    var jobList = [];
    for (var i = 0; i < jobs.length; i++) {
       var job = internals.Gills.settings.plugins.tacklebox.getJob(jobs[i]);
       jobList.push(job) 
    }
    //console.log(jobList);
    var config = {
        view_jobs: true,
        angler: 'lloyd',
        jobs: jobList
    };
    reply.view('layout', config);   
};

exports.createJob = function (request, reply) {

    //console.log(request.payload);
    var config = {
        name: request.payload.name,
        description: request.payload.description,
        scm: {
            type: request.payload.scm_type,
            url: request.payload.scm_url,
            branch: request.payload.scm_branch
        },
        head: request.payload.head,
        body: request.payload.body,
        tail: request.payload.tail
    };
    //console.log(config);
    var createConfig = internals.Gills.settings.plugins.tacklebox.createJob(config);
    reply.redirect('/gills/job/'+ createConfig.id);
};

exports.getJob = function (request, reply) {

    var job = {};
    var config = {};
    var runs = [];
    if (request.params.id) {
        job = internals.Gills.settings.plugins.tacklebox.getJob(request.params.id);
        var runArray = [];
        if (job.runs.toString() !== '') {
            runArray = job.runs.toString().replace('[','').replace(']','').split(',');
        }
        //for (var i = 0; i < runArray.length; i++) {
        for (var i = runArray.length -1 ; i>=0; i--) {

            var run = internals.Gills.settings.plugins.tacklebox.getRun(runArray[i]); 
            var shortId = runArray[i].split('-')[0];
            var utils = new Utils();
            var formatFinish = utils.shortDate(run.finishTime);
            var elapsedTime = utils.shortTime(run.finishTime - run.startTime);

            var runConfig = {
                id: request.params.id,
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
            runs: runs
        };
    }
    else {
        config.post_url = '/gills/job';
    }
    config.view_job = true; 
    config.angler = 'lloyd';
    reply.view('layout', config);   
};

exports.updateJob = function (request, reply) {

    var config = {
        id: request.params.id,
        name: request.payload.name,
        description: request.payload.description,
        scm: {
            type: request.payload.scm_type,
            url: request.payload.scm_url,
            branch: request.payload.scm_branch
        },
        head: request.payload.head,
        body: request.payload.body,
        tail: request.payload.tail
    };
    var updateConfig = internals.Gills.settings.plugins.tacklebox.updateJob(config.id, config);
    reply.redirect('/gills/job/'+ updateConfig.id);
};

exports.deleteJob = function (request, reply) {

    internals.Gills.settings.plugins.tacklebox.deleteJob(request.params.id);
    reply.redirect('/gills/jobs');
};

exports.runJob = function (request, reply) {

    internals.Gills.settings.plugins.tacklebox.startRun(request.params.id);
    reply.redirect('/gills/job/' + request.params.id);
};

exports.getRun = function (request, reply) {

    var run = internals.Gills.settings.plugins.tacklebox.getRun(request.params.run_id);
    var job = internals.Gills.settings.plugins.tacklebox.getJob(request.params.id);
    var commands = [];
    for (var i = 0; i < run.commands.length; i++) {
        //console.log(run.commands[i]);
        var utils = new Utils();
        run.commands[i].finishTime = utils.shortDate(run.commands[i].finishTime);
        run.commands[i].startTime = utils.shortDate(run.commands[i].startTime);
        commands.push(run.commands[i]);
    }
    var commandsArray = run.commands.toString().replace('[','').replace(']','').split(',');
    var shortRunId = request.params.run_id.split('-')[0];
    var config = {
       id: job.id,
       name: job.name,
       run_id: run.id,
       short_run_id: shortRunId,
       commands: commands
    };
    config.view_run = true; 
    config.angler = 'lloyd';
    reply.view('layout', config);   
};

exports.deleteRun = function (request, reply) {

    internals.Gills.settings.plugins.tacklebox.deleteRun(request.params.id, request.params.run_id);
    reply.redirect('/gills/job/' + request.params.id );
};

exports.getReel = function (request, reply) {

    var reel = {};
    var config = {};
/*
    if (request.params.id) {
        reel = internals.Gills.settings.plugins.tacklebox.getReel(request.params.id);
        config = {
            post_url: '/gills/reel/'+reel.id,
            id: reel.id,
            name: reel.name,
            description: reel.description,
            size: reel.size
        };
    }
    else {
*/
        config.post_url = '/gills/reel';
//    }
    config.view_reel = true; 
    config.angler = 'lloyd';
    reply.view('layout', config);   
};

/*

exports.createReel = function (request, reply) {

    //console.log(request.payload);
    var config = {
        name: request.payload.name,
        description: request.payload.description,
        size: request.payload.size
    };
    //console.log(config);
    //var createConfig = internals.Gills.settings.plugins.tacklebox.createReel(config);
    //reply.redirect('/gills/queue/'+ createConfig.id);
    reply.redirect('/gills/jobs');
};

*/
