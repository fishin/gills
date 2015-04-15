var Bait = require('bait');
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

var bait = new Bait(internals.defaults.job);


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

    it('POST /view/job valid', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                bodyCommand0: 'date'
            };
            server.inject({ method: 'POST', url: '/view/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/job/{jobId}/start valid', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/start'}, function (response) {

                //console.log('starting job: ' + jobId);
                expect(response.statusCode).to.equal(302);
                server.inject({ method: 'GET', url: '/view/job/' + jobId}, function (response) {

                    expect(response.statusCode).to.equal(200);
                });
                var runId1 = bait.getRuns(jobId, null)[0].id;
                expect(runId1).to.exist();
                var intervalObj = setInterval(function() {

                    var run1 = bait.getRun(jobId, null, runId1);
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

    it('POST /view/job/{jobId} invalid', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            var updatePayload = {
                bodyCommand0: 'invalid'
            };
            server.inject({ method: 'POST', url: '/view/job/' + jobId, payload: updatePayload}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/job/{jobId}/start invalid', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/start'}, function (response) {

                //console.log('starting job: ' + jobId);
                expect(response.statusCode).to.equal(302);
                server.inject({ method: 'GET', url: '/view/job/' + jobId}, function (response) {

                    expect(response.statusCode).to.equal(200);
                });
                var runId2 = bait.getRuns(jobId, null)[0].id;
                expect(runId2).to.exist();
                var intervalObj = setInterval(function() {

                    var run2 = bait.getRun(jobId, null, runId2);
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

    it('POST /view/job/{jobId} valid', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            var updatePayload = {
                bodyCommand0: 'date'
            };
            server.inject({ method: 'POST', url: '/view/job/' + jobId, payload: updatePayload}, function (response) {

                //console.log(response);
                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/job/{jobId}/start valid', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/start'}, function (response) {

                //console.log('starting job: ' + jobId);
                expect(response.statusCode).to.equal(302);
                server.inject({ method: 'GET', url: '/view/job/' + jobId}, function (response) {

                    expect(response.statusCode).to.equal(200);
                });
                var runId3 = bait.getRuns(jobId, null)[0].id;
                expect(runId3).to.exist();
                var intervalObj = setInterval(function() {

                    var run3 = bait.getRun(jobId, null, runId3);
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

    it('GET /view/job/{jobId}/delete', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });
/*
    it('POST /view/job refresh', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                scm_type: 'git',
                scm_url: 'https://github.com/fishin/pail',
                scm_branch: 'master',
                bodyCommand0: 'npm install',
                tailCommand0: 'npm test'
            };
            server.inject({ method: 'POST', url: '/view/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/job/{jobId}/start refresh', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            expect(jobId).to.exist();
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/start'}, function (response) {

                //console.log('starting job: ' + jobId);
                expect(response.statusCode).to.equal(302);
                server.inject({ method: 'GET', url: '/view/job/' + jobId}, function (response) {

                    expect(response.statusCode).to.equal(200);
                });
                var runId = bait.getRuns(jobId, null)[0].id;
                expect(runId).to.exist();
                var intervalObj = setInterval(function() {

                    server.inject({ method: 'GET', url: '/view/job/' + jobId}, function (response) {

                        expect(response.statusCode).to.equal(200);
                    });
                    var run = bait.getRun(jobId, null, runId);
                    if (run.finishTime) {

                        clearInterval(intervalObj);
                        expect(run.finishTime).to.exist();
                        expect(run.id).to.exist();
                        expect(run.status).to.equal('succeeded');
                        done();
                    }
                }, 1000);
            });
        });
    });

    it('GET /view/job/{jobId}/delete refresh', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

*/
});
