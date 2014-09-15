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
        angler: 'lloyd',
        jobs: jobs
    };
    reply.view('layout', config);   
};

exports.createJob = function (request, reply) {

    var config = {
        job: 'new',
        angler: 'lloyd'
    };
    reply.view('layout', config);   
};
