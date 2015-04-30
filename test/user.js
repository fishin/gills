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


describe('user', function () {

    it('GET /view/user', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/user',
                file: 'empty.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'GET', url: '/view/user' }, function (response) {

                        expect(response.statusCode).to.equal(200);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/user lloyd', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'post',
                path: '/api/user',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                var payload = {
                    name: 'lloyd',
                    type: 'local',
                    displayName: 'Lloyd Benson',
                    email: 'lloyd.benson@gmail.com',
                    password: 'password'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'POST', url: '/view/user', payload: payload }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/user admin', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'post',
                path: '/api/user',
                file: 'admin.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                var payload = {
                    name: 'admin',
                    type: 'local',
                    displayName: 'Admin',
                    email: 'admin@localhost',
                    password: 'password'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'POST', url: '/view/user', payload: payload }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/user/{userId} lloyd', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/user/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var userId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/user/' + userId }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(userId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/user/{userId} admin', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/user/12345678-1234-1234-1234-123456789013',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var userId = '12345678-1234-1234-1234-123456789013';
                    server.inject({ method: 'GET', url: '/view/user/' + userId }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(userId);
                        done();
                    });
                });
            });
        });
    });


    it('GET /view/users', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/users',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'GET', url: '/view/users' }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/user/{userId} lloyd', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'put',
                path: '/api/user/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                var payload = {
                    displayName: 'Lloyd Benson1',
                    type: 'local',
                    password: '$2a$10$6VgpayiqXWo8DB0FA6XZ5uH26WsryzRib3YJJvHzVCQC9eHRl4xea'
                };
                internals.prepareServer(function (server) {

                    var userId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'POST', url: '/view/user/' + userId, payload: payload }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/user/{userId} newpass', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'put',
                path: '/api/user/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                var payload = {
                    displayName: 'Lloyd Benson',
                    type: 'local',
                    password: 'password1'
                };
                internals.prepareServer(function (server) {

                    var userId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'POST', url: '/view/user/' + userId, payload: payload }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/user/{userId}/delete', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'delete',
                path: '/api/user/12345678-1234-1234-1234-123456789012',
                file: 'empty.txt'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'GET', url: '/view/user/12345678-1234-1234-1234-123456789012/delete' }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });
});
