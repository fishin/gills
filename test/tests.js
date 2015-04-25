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

describe('tests', function () {

    it('POST /view/job', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                scm_type: 'git',
                scm_url: 'https://github.com/fishin/pail',
                scm_branch: 'master',
                bodyCommand0: 'npm install',
                bodyCommand1: 'npm run-script json',
                archivePattern: 'lab.json'
            };
            server.inject({ method: 'POST', url: '/view/job', payload: payload}, function (response) {

                //console.log(response);
                expect(response.statusCode).to.equal(302);
                var jobId = bait.getJobs()[0].id;
                expect(jobId).to.exist();
                done();
            });
        });

    });

    it('GET /view/job/{jobId}', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId}, function (response) {

                //console.log(response.result);
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('GET /view/job/{jobId}/start', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/start'}, function (response) {

                //console.log('starting job: ' + jobId);
                expect(response.statusCode).to.equal(302);
                var runId = bait.getRuns(jobId, null)[0].id;
                //console.log('runId: ' + runId);
                expect(runId).to.exist();
                server.inject({ method: 'GET', url: '/view/job/' + jobId}, function (response) {

                    expect(response.statusCode).to.equal(200);
                });
                var intervalObj = setInterval(function () {

                    var run = bait.getRun(jobId, null, runId);
                    if (run.finishTime) {
                        clearInterval(intervalObj);
                        expect(run.finishTime).to.exist();
                        expect(run.id).to.exist();
                        server.inject({ method: 'GET', url: '/view/job/' + jobId}, function (response) {

                            expect(response.statusCode).to.equal(200);
                            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/run/' + runId}, function (response) {

                                expect(response.statusCode).to.equal(200);
                                done();
                            });
                        });
                    }
                }, 1000);
            });
        });
    });

    it('GET /view/job/{jobId}/run/{runId}/test', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            var runId = bait.getRuns(jobId, null)[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/run/' + runId + '/test' }, function (response) {

                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('GET /view/job/{jobId}/run/{runId}/archive/{file}', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            var runId = bait.getRuns(jobId, null)[0].id;
            var file = 'lab.json';
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/run/' + runId + '/archive/' + file }, function (response) {

                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('GET /view/job/{jobId}/run/{runId}/coverage', function (done) {

        internals.prepareServer(function (server) {

            var jobId = bait.getJobs()[0].id;
            var runId = bait.getRuns(jobId, null)[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/run/' + runId + '/coverage' }, function (response) {

                expect(response.statusCode).to.equal(200);
                done();
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
});
