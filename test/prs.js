var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');
var Mock = require('mock');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var internals = {
    defaults: {
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
    });
    callback(server);
};

describe('prs', function () {

    it('GET /view/job/{jobId}', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/runs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/pids',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/test/lab.json',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/prs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/runs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/2/runs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/reels',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/queue',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/run/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/2/run/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId} active', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/prs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/runs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/2/runs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/reels',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/queue',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/prs/active',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/run/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/2/run/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/byname/last',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });


    it('GET /view/job/{jobId} no run', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/runs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/pids',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/test/lab.json',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/prs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/runs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/reels',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/queue',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/jobs/active',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/prs/active',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/run/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/2/run/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/pr/{number}/merge', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/merge',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.ext('onPreResponse', function (request, reply) {

                        request.auth.session.set({

                            userId: 1,
                            name: 'lloyd',
                            token: 'secrettoken',
                            displayName: 'Lloyd Benson',
                            url: 'http://lloydbenson.com',
                            type: 'github'
                        });
                        reply.continue();
                    });
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/pr/1/merge' }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/pr/{number}/merge failed', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/merge',
                file: 'failed.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.ext('onPreResponse', function (request, reply) {

                        request.auth.session.set({

                            userId: 1,
                            name: 'lloyd',
                            token: 'secrettoken',
                            displayName: 'Lloyd Benson',
                            url: 'http://lloydbenson.com',
                            type: 'github'
                        });
                        reply.continue();
                    });
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/pr/1/merge' }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });
});
