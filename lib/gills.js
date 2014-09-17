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
}

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
    if (request.params.id) {
        job = internals.Gills.settings.plugins.tacklebox.getJob(request.params.id);
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
            tail: job.tail
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
    reply.redirect('/gills/jobs');
};
