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

describe('jobs', function () {    

    it('POST /gills/job invalid', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'invalid',
                description: 'description',
                bodyCommand0: 'invalid'
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /gills/job/{jobId)/start invalid', function (done) {

        internals.prepareServer(function (server) {

            var jobId1 = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/gills/job/'+jobId1+ '/start'}, function (response) {

                //console.log('starting job: ' + jobId1);
                expect(response.statusCode).to.equal(302);
                server.inject({ method: 'GET', url: '/gills/job/'+jobId1}, function (response) {

                    expect(response.statusCode).to.equal(200);
                });
                var runId = server.plugins.tacklebox.getRuns(jobId1)[0];
                expect(runId).to.exist(); 
                var intervalObj1 = setInterval(function() {

                    var run = server.plugins.tacklebox.getRun(jobId1, runId);
                    if (run.finishTime) {

                        clearInterval(intervalObj1);   
                        expect(run.finishTime).to.exist();
                        expect(run.id).to.exist();
                        expect(run.status).to.equal('failed');
                        done();
                    }
                }, 1000);
            });
        });
    });

    it('POST /gills/job valid', function (done) {

        internals.prepareServer(function (server) {

            var payload2 = {
                name: 'date',
                description: 'description',
                bodyCommand0: 'date'
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload2}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /gills/job/{job_id}/start valid', function (done) {

        internals.prepareServer(function (server) {

            var jobId2 = server.plugins.tacklebox.getJobs()[1].id;
            expect(jobId2).to.exist();
            server.inject({ method: 'GET', url: '/gills/job/'+jobId2+ '/start'}, function (response) {

                //console.log('starting job: ' + jobId2);
                expect(response.statusCode).to.equal(302);
                server.inject({ method: 'GET', url: '/gills/job/'+jobId2}, function (response) {

                    expect(response.statusCode).to.equal(200);
                });
                var runId = server.plugins.tacklebox.getRuns(jobId2)[0];
                expect(runId).to.exist(); 
                var intervalObj2 = setInterval(function() {

                    var run = server.plugins.tacklebox.getRun(jobId2, runId);
                    if (run.finishTime) {

                        clearInterval(intervalObj2);   
                        expect(run.finishTime).to.exist();
                        expect(run.id).to.exist();
                        expect(run.status).to.equal('succeeded');
                        done();
                    }    
                }, 1000);
            });
        });
    });

    it('GET /gills/jobs', function (done) {

        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/gills/jobs'}, function (response) {

                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('GET /gills/job/{jobId}/delete invalid', function (done) {

        internals.prepareServer(function (server) {

            var jobId1 = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/gills/job/'+jobId1+ '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /gills/job/{jobId}/delete valid', function (done) {

        internals.prepareServer(function (server) {

            var jobId2 = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/gills/job/'+jobId2+ '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });
});
