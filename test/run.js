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

describe('run', function () {

    it('POST /view/job failed', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                bodyCommand0: 'invalid'
            };
            server.inject({ method: 'POST', url: '/view/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/job/{jobId}/start failed', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/start'}, function (response) {

                //console.log('starting job: ' + jobId);
                //expect(response.statusCode).to.equal(302);
                var runId = bait.getRuns(jobId, null)[0].id;
                expect(runId).to.exist();
                var intervalObj = setInterval(function () {

                    var run = bait.getRun(jobId, null, runId);
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

    it('GET /view/job/{jobId} failed', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId}, function (response) {

                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('GET /view/job/{jobId}/delete failed', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('POST /view/job cancelled', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'cancel',
                description: 'description',
                scm_type: 'git',
                scm_url: 'https://github.com/fishin/pail',
                scm_branch: 'master',
                bodyCommand0: 'npm install',
                bodyCommand1: 'npm test'
            };
            server.inject({ method: 'POST', url: '/view/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/job/{jobId)/start cancelled', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/start'}, function (response) {

                //console.log('starting job: ' + jobId);
                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/job/{jobId)/run/{runId}/cancel cancelled', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            var runId = bait.getRuns(jobId, null)[0].id;
            expect(runId).to.exist();
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/run/' + runId + '/cancel'}, function (response) {

                expect(response.statusCode).to.equal(302);
                var intervalObj = setInterval(function () {

                    var run = bait.getRun(jobId, null, runId);
                    if (run.finishTime) {
                        clearInterval(intervalObj);
                        //console.log(run);
                        expect(run.finishTime).to.exist();
                        expect(run.status).to.equal('cancelled');
                        expect(run.commands.length).to.be.equal(2);
                        done();
                    }
                }, 1000);
            });
        });
    });

    it('GET /view/job/{jobId} cancelled', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId}, function (response) {

                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('GET /view/job/{jobId}/delete cancelled', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });
});
