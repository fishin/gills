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

describe('runs', function () {    

    it('POST /gills/job valid', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                body: 'date'
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /gills/job/{jobId}/start valid', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/start'}, function (response) {

                console.log('starting job: ' + jobId);
                expect(response.statusCode).to.equal(302);
                server.inject({ method: 'GET', url: '/gills/job/'+jobId}, function (response) {

                    expect(response.statusCode).to.equal(200);
                });
                var runId1 = server.plugins.tacklebox.getRuns(jobId)[0].id;
                expect(runId1).to.exist(); 
                var intervalObj = setInterval(function() {

                    var run1 = server.plugins.tacklebox.getRun(jobId, runId1);
                    if (run1.finishTime) {

                        clearInterval(intervalObj);   
                        expect(run1.finishTime).to.exist();
                        expect(run1.id).to.exist();
                        expect(run1.status).to.equal('succeeded');
                        done();
                    }
                }, 1000);
            });
        });
    });

    it('POST /gills/job/{jobId} invalid', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            var updatePayload = { body: 'invalid' }; 
            server.inject({ method: 'POST', url: '/gills/job/'+jobId, payload: updatePayload}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /gills/job/{jobId}/start invalid', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/start'}, function (response) {

                console.log('starting job: ' + jobId);
                expect(response.statusCode).to.equal(302);
                server.inject({ method: 'GET', url: '/gills/job/'+jobId}, function (response) {

                    expect(response.statusCode).to.equal(200);
                });
                var runId2 = server.plugins.tacklebox.getRuns(jobId)[0].id;
                expect(runId2).to.exist(); 
                var intervalObj = setInterval(function() {

                    var run2 = server.plugins.tacklebox.getRun(jobId, runId2);
                    if (run2.finishTime) {

                        clearInterval(intervalObj);   
                        expect(run2.finishTime).to.exist();
                        expect(run2.id).to.exist();
                        expect(run2.status).to.equal('failed');
                        done();
                    }
                }, 1000);
            });
        });
    });

    it('POST /gills/job/{jobId} valid', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            var updatePayload2 = { body: 'date' }; 
            server.inject({ method: 'POST', url: '/gills/job/'+jobId, payload: updatePayload2}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /gills/job/{jobId}/start valid', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/start'}, function (response) {

                console.log('starting job: ' + jobId);
                expect(response.statusCode).to.equal(302);
                server.inject({ method: 'GET', url: '/gills/job/'+jobId}, function (response) {

                    expect(response.statusCode).to.equal(200);
                });
                var runId3 = server.plugins.tacklebox.getRuns(jobId)[0].id;
                expect(runId3).to.exist(); 
                var intervalObj = setInterval(function() {

                    var run3 = server.plugins.tacklebox.getRun(jobId, runId3);
                    if (run3.finishTime) {

                        clearInterval(intervalObj);   
                        expect(run3.finishTime).to.exist();
                        expect(run3.id).to.exist();
                        expect(run3.status).to.equal('succeeded');
                        done();
                    }
                }, 1000);
            });
        });
    });

    it('GET /gills/job/{jobId}/delete', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('refresh', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                scm_type: 'git',
                scm_url: 'https://github.com/fishin/pail',
                scm_branch: 'master',
                head: 'npm install',
                body: 'npm test',
                tail: ''
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                var jobId = server.plugins.tacklebox.getJobs()[0].id;
                expect(jobId).to.exist();
                server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/start'}, function (response) {

                    console.log('starting job: ' + jobId);
                    expect(response.statusCode).to.equal(302);
                    server.inject({ method: 'GET', url: '/gills/job/'+jobId}, function (response) {

                        expect(response.statusCode).to.equal(200);
                    });
                    var runId = server.plugins.tacklebox.getRuns(jobId)[0].id;
                    expect(runId).to.exist(); 
                    var begin = new Date().getTime();
                    var intervalObj = setInterval(function() {

                        server.inject({ method: 'GET', url: '/gills/job/'+jobId}, function (response) {

                            expect(response.statusCode).to.equal(200);
                        });
                        var run = server.plugins.tacklebox.getRun(jobId, runId);
                        if (run.finishTime) {

                            clearInterval(intervalObj);   
                            expect(run.finishTime).to.exist();
                            expect(run.id).to.exist();
                            expect(run.status).to.equal('succeeded');
                            server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/delete'}, function (response) {

                                expect(response.statusCode).to.equal(302);
                                done();
                            });
                        };
                    }, 1000);
                });
            });
        });
    });

});
