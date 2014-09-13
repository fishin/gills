var Fs = require('fs');
var Tacklebox = require('tacklebox');

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
        name: 'lloyd',
        jobs: jobs
    };
    reply.view('jobs', config);   
};
