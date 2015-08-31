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


describe('queue', function () {

    it('GET /view/queue/{jobId}/add', function (done) {

        var jobId = '12345678-1234-1234-1234-123456789012';
        var type = 'tacklebox';
        var routes = [
            {
                method: 'post',
                path: '/api/queue',
                file: 'null'
            },
            {
                method: 'get',
                path: '/api/queue',
                file: 'jobs.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'GET', url: '/view/queue/' + jobId + '/add' }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/queue/{jobId}/remove', function (done) {

        var jobId = '12345678-1234-1234-1234-123456789012';
        var type = 'tacklebox';
        var routes = [
            {
                method: 'delete',
                path: '/api/queue/' + jobId,
                file: 'null'
            },
            {
                method: 'get',
                path: '/api/queue',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'GET', url: '/view/queue/' + jobId + '/remove' }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/queue/{jobId}/pr/{number}/remove', function (done) {

        var jobId = '12345678-1234-1234-1234-123456789012';
        var type = 'tacklebox';
        var routes = [
            {
                method: 'delete',
                path: '/api/queue/' + jobId + '/pr/1',
                file: 'null'
            },
            {
                method: 'get',
                path: '/api/queue',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'GET', url: '/view/queue/' + jobId + '/pr/1/remove' }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });
});
