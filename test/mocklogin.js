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


describe('mock login', function () {

    it('GET /view/login', function (done) {

        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/view/login' }, function (response) {

                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('GET /view/logout nologin', function (done) {

        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/view/logout' }, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('POST /view/job', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/user/byname/lloyd',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/user/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/user/12345678-1234-1234-1234-123456789012/validate',
                file: 'true'
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
                    password: 'password'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'POST', url: '/view/login', payload: payload }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        var artifacts = response.request.auth.artifacts;
                        expect(artifacts.userId.length).to.equal(36);
                        expect(artifacts.name).to.equal('lloyd');
                        expect(artifacts.displayName).to.equal('Lloyd Benson');
                        expect(artifacts.type).to.equal('local');
                        done();
                    });
                });
            });
        });
    });
});
