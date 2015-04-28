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


describe('mock job', function () {

    it('GET /view/job', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job',
                file: 'empty.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'GET', url: '/view/job' }, function (response) {

                        expect(response.statusCode).to.equal(200);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/job', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'post',
                path: '/api/job',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                var payload = {
                    name: 'name',
                    description: 'description',
                    headCommand0: 'date',
                    scmType: 'git',
                    scmUrl: 'https://github.com/fishin/pail',
                    scmBranch: 'master',
                    scmPrs: true,
                    bodyCommand0: 'npm install',
                    bodyCommand1: 'npm test'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'POST', url: '/view/job', payload: payload }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

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

    it('GET /view/job/{jobId} full', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789013',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789013';
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

    it('GET /view/jobs', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/jobs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/byname/last',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789014/run/byname/last',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'GET', url: '/view/jobs' }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/job/{jobId}', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'post',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                var payload = {
                    headCommand0: 'date',
                    description: 'description2',
                    tailCommand0: 'bin/tail.sh'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'POST', url: '/view/job/' + jobId, payload: payload }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/start', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/start',
                file: 'empty.txt'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/start' }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/commits', function (done) {

        var type = 'tacklebox';
        // need jobId to add repoUrl maybe add this right in bobber
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/commits',
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
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/commits' }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain('lloyd');
                        expect(response.result).to.contain('github.com');
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/workspace/delete', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'delete',
                path: '/api/job/12345678-1234-1234-1234-123456789012/workspace/delete',
                file: 'empty.txt'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/workspace/delete' }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/delete', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'delete',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'empty.txt'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'GET', url: '/view/job/12345678-1234-1234-1234-123456789012/delete' }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });
});
