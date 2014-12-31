var Code = require('code');
var Lab = require('lab');
var Hapi = require('hapi');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var internals = {
    defaults: {
        apiPath: '/gills',
        job: {
            dirpath: '/tmp/testgills/job'
        },
        reel: {
            dirpath: '/tmp/testgills/reel'
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

describe('run', function () {    

    it('POST /gills/job failed', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                bodyCommand1: 'invalid'
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /gills/job/{jobId}/start failed', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/start'}, function (response) {
                    
                //console.log('starting job: ' + jobId);
                //expect(response.statusCode).to.equal(302);
                var runId = server.plugins.tacklebox.getRuns(jobId)[0].id;
                expect(runId).to.exist(); 
                var intervalObj = setInterval(function() {

                    var run = server.plugins.tacklebox.getRun(jobId, runId);
                    if (run.finishTime) {
                        clearInterval(intervalObj);
                        expect(run.finishTime).to.exist();
                        expect(run.status).to.equal('failed');
                        done();
                    }
                }, 1000);
            });
        });
    });

    it('GET /gills/job/{jobId} failed', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/gills/job/'+jobId}, function (response) {
                      
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('GET /gills/job/{jobId}/delete failed', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('POST /gills/job cancelled', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'cancel',
                description: 'description',
                scm_type: 'git',
                scm_url: 'https://github.com/fishin/pail',
                scm_branch: 'master',
                bodyCommand1: 'npm install',
                bodyCommand2: 'npm test'
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /gills/job/{jobId)/start cancelled', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/start'}, function (response) {
                    
                //console.log('starting job: ' + jobId);
                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /gills/job/{jobId)/run/{runId}/cancel cancelled', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            var runId = server.plugins.tacklebox.getRuns(jobId)[0].id;
            expect(runId).to.exist(); 
            server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/run/' + runId + '/cancel'}, function (response) {

                expect(response.statusCode).to.equal(302);
                var intervalObj = setInterval(function() {

                    var run = server.plugins.tacklebox.getRun(jobId, runId);
                    if (run.finishTime) {
                        clearInterval(intervalObj);
                        //console.log(run);
                        expect(run.finishTime).to.exist();
                        expect(run.status).to.equal('cancelled');
                        expect(run.commands).to.be.length(3);
                        done();
                    }
                }, 1000);
            });
        });
    });

    it('GET /gills/job/{jobId} cancelled', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/gills/job/'+jobId}, function (response) {
                        
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('GET /gills/job/{jobId}/delete cancelled', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });
});
