var Code = require('code');
var Lab = require('lab');
var Hapi = require('hapi');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var internals = {
    defaults: {
        viewPath: '/view',
        job: {
            dirPath: '/tmp/testgills/job'
        },
        reel: {
            dirPath: '/tmp/testgills/reel'
        }
    }
};

internals.prepareServer = function (callback) {

    var server = new Hapi.Server();
    server.connection();

    server.register({
        register: require('..'),
        options: internals.defaults
    }, function (err) {

        expect(err).to.not.exist();
        callback(server);
   });
};

describe('job', function () {    

    it('POST /view/job', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                headCommand0: 'date',
                scm_type: 'git',
                scm_url: 'https://github.com/fishin/pail',
                scm_branch: 'master',
                bodyCommand0: 'npm install',
                bodyCommand1: 'npm test'
            };
            server.inject({ method: 'POST', url: '/view/job', payload: payload}, function (response) {

                //console.log(response);
                expect(response.statusCode).to.equal(302);
                var jobId = server.plugins.tacklebox.getJobs()[0].id;
                expect(jobId).to.exist();
                done();
            });
        });

    });

    it('GET /view/job/{jobId}', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/'+jobId}, function (response) {
       
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

    });

    it('POST /view/job/{jobId}', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            var updatePayload = {
                headCommand0: 'date',
                description: "description2",
                tailCommand0: "bin/tail.sh"
            }; 
            server.inject({ method: 'POST', url: '/view/job/'+jobId, payload: updatePayload}, function (response) {

                expect(response.statusCode).to.equal(302);
                server.inject({ method: 'GET', url: '/view/jobs'}, function (response) {

                    expect(response.statusCode).to.equal(200);
                    expect(response.result).to.exist();
                    done();
                });
            });
        });

    });

    it('GET /view/job/{jobId}/start', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/'+jobId+ '/start'}, function (response) {

                //console.log('starting job: ' + jobId);
                expect(response.statusCode).to.equal(302);
                var runId = server.plugins.tacklebox.getRuns(jobId)[0].id;
                //console.log('runId: ' + runId);
                expect(runId).to.exist(); 
                server.inject({ method: 'GET', url: '/view/job/'+jobId}, function (response) {

                   expect(response.statusCode).to.equal(200);
                });
                var intervalObj = setInterval(function() {

                    var run = server.plugins.tacklebox.getRun(jobId, runId);
                    if (run.finishTime) {
                        clearInterval(intervalObj);   
                        expect(run.finishTime).to.exist();
                        expect(run.id).to.exist();
                        server.inject({ method: 'GET', url: '/view/job/'+jobId}, function (response) {

                            expect(response.statusCode).to.equal(200);
                            server.inject({ method: 'GET', url: '/view/job/'+jobId+ '/run/' + runId}, function (response) {

                                expect(response.statusCode).to.equal(200);
                                done();
                            });
                        });
                    }
                }, 1000);
            });
        });
    });

    it('GET /view/job/{job_id}/run/{runId}/delete', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            var runId = server.plugins.tacklebox.getRuns(jobId)[0].id;
            server.inject({ method: 'GET', url: '/view/job/'+jobId+ '/run/' + runId + '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/job/{job_id}/workspace/delete', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/'+jobId+ '/workspace/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/job/{jobId}/delete', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/'+jobId+ '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });
});
