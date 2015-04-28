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
        viewPath: '/view',
        job: {
            dirPath: '/tmp/testgills/job'
        },
        reel: {
            dirPath: '/tmp/testgills/reel'
        },
        user: {
            dirPath: '/tmp/testgills/user'
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

describe('queue', function () {

    it('GET /view/queue/{jobId}/add 1', function (done) {

        internals.prepareServer(function (server) {

            var jobId = '12345678-1234-1234-1234-123456789012';
            server.inject({ method: 'GET', url: '/view/queue/' + jobId + '/add' }, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/queue/{jobId}/add 2', function (done) {

        internals.prepareServer(function (server) {

            var jobId = '12345678-1234-1234-1234-123456789013';
            server.inject({ method: 'GET', url: '/view/queue/' + jobId + '/add' }, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
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
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/queue/' + jobId + '/add' }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        server.inject({ method: 'GET', url: '/view/jobs' }, function (response) {

                            //console.log(response.result);
                            expect(response.statusCode).to.equal(200);
                            done();
                        });
                    });
                });
            });
        });
    });

    it('GET /view/jobs no last run', function (done) {

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
                file: 'null'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/queue/' + jobId + '/add' }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        server.inject({ method: 'GET', url: '/view/jobs' }, function (response) {

                            //console.log(response.result);
                            expect(response.statusCode).to.equal(200);
                            done();
                        });
                    });
                });
            });
        });
    });

    it('GET /view/queue/{jobId}/remove 2', function (done) {

        internals.prepareServer(function (server) {

            var jobId = '12345678-1234-1234-1234-123456789013';
            server.inject({ method: 'GET', url: '/view/queue/' + jobId + '/remove' }, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/queue/{jobId}/remove 1', function (done) {

        internals.prepareServer(function (server) {

            var jobId = '12345678-1234-1234-1234-123456789012';
            server.inject({ method: 'GET', url: '/view/queue/' + jobId + '/remove' }, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });
});
