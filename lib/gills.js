var Fs = require('fs');

exports.redirectHome = function (request, reply) {

    reply.redirect('/gills/jobs');
};

exports.getJobs = function (request, reply) {

    var jobs = [
        { id: '1001' },
        { id: '1002' },
        { id: '1003' },
        { id: '1004' }
    ];

    var config = {
        view_jobs: true,
        angler: 'lloyd',
        jobs: jobs
    };
    reply.view('layout', config);   
};

exports.createJob = function (request, reply) {

    var config = {
        view_job: true,
        job: 'new',
        angler: 'lloyd'
    };
    reply.view('layout', config);   
};

exports.updateJob = function (request, reply) {

    var config = {
        view_job: true,
        id: request.params.id,
        angler: 'lloyd'
    };
    reply.view('layout', config);   
};
