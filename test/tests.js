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


describe('tests', function () {

    it('GET /view/job/{jobId}/run/{runId}/archive/test.lab', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/archive/test.lab',
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
                    var runId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/run/' + runId + '/archive/test.lab' }, function (response) {

                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        expect(response.result).to.contain(runId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/run/{runId}/archive/test.html', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/archive/test.html',
                file: 'test.html'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    var runId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/run/' + runId + '/archive/test.html' }, function (response) {

                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain('<html>');
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/run/{runId}/test', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/test/test.lab',
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
                    var runId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/run/' + runId + '/test' }, function (response) {

                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        expect(response.result).to.contain(runId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/run/{runId}/coverage', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/test/test.lab',
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
                    var runId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/run/' + runId + '/coverage' }, function (response) {

                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        expect(response.result).to.contain(runId);
                        done();
                    });
                });
            });
        });
    });
});
