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
        user: {
            dirPath: '/tmp/testgills/user'
        },
        reel: {
            dirPath: '/tmp/testgills/reel'
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

describe('user', function () {    

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

    it('POST /view/user', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'lloyd',
                displayName: 'Lloyd Benson1',
                email: 'lloyd.benson@gmail.com',
                password: 'password'
            };
            server.inject({ method: 'POST', url: '/view/user', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                var user = server.plugins.tacklebox.getUsers()[0];
                expect(user.name).to.equal('lloyd');
                expect(user.displayName).to.equal('Lloyd Benson1');
                expect(user.email).to.equal('lloyd.benson@gmail.com');
                expect(user.password.length).to.equal(60);
                done();
            });
        });
    });

    it('GET /view/user/{userId}', function (done) {

        internals.prepareServer(function (server) {

            var userId = server.plugins.tacklebox.getUsers()[0].id;
            server.inject({ method: 'GET', url: '/view/user/'+userId}, function (response) {

                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('POST /view/user/{userId}', function (done) {

        internals.prepareServer(function (server) {

            var userId = server.plugins.tacklebox.getUsers()[0].id;
            var updatePayload = {
                displayName: "Lloyd Benson"
            }; 
            server.inject({ method: 'POST', url: '/view/user/'+userId, payload: updatePayload}, function (response) {

                expect(response.statusCode).to.equal(302);
                server.inject({ method: 'GET', url: '/view/user'}, function (response) {

                    expect(response.statusCode).to.equal(200);
                    var user = server.plugins.tacklebox.getUsers()[0];
                    expect(user.displayName).to.equal('Lloyd Benson');
                    done();
                });
            });
        });
    });

    it('POST /view/login', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'lloyd',
                type: 'local',
                password: 'password'
            };
            server.inject({ method: 'POST', url: '/view/login', payload: payload }, function (response) {

                expect(response.statusCode).to.equal(302);
                var artifacts = response.request.auth.artifacts;
                expect(artifacts.userId.length).to.equal(36);
                expect(artifacts.name).to.equal('lloyd');
                expect(artifacts.displayName).to.equal('Lloyd Benson');
                expect(artifacts.type).to.equal('local');
                server.inject({ method: 'GET', url: '/view/logout' }, function (response) {

                    expect(response.statusCode).to.equal(302);
                    expect(response.request.auth.artifacts).to.not.exist();
                    done();
                });
            });
        });
    });

    it('POST /view/login invalid user', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'lloyd1',
                type: 'local',
                password: 'password'
            };
            server.inject({ method: 'POST', url: '/view/login', payload: payload }, function (response) {

                expect(response.request.auth.artifacts).to.not.exist();
                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('POST /view/login invalid password', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'lloyd',
                type: 'local',
                password: 'password1'
            };
            server.inject({ method: 'POST', url: '/view/login', payload: payload }, function (response) {

                expect(response.request.auth.artifacts).to.not.exist();
                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('POST /view/login no user', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                type: 'local'
            };
            server.inject({ method: 'POST', url: '/view/login', payload: payload }, function (response) {

                expect(response.request.auth.artifacts).to.not.exist();
                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/logout', function (done) {

        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/view/logout' }, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/user/{userId}/delete', function (done) {

        internals.prepareServer(function (server) {

            var userId = server.plugins.tacklebox.getUsers()[0].id;
            server.inject({ method: 'GET', url: '/view/user/'+userId+ '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('POST /view/login', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'admin',
                type: 'local',
                password: 'admin'
            };
            server.inject({ method: 'POST', url: '/view/login', payload: payload }, function (response) {

                var artifacts = response.request.auth.artifacts;
                expect(artifacts.name).to.equal('admin');
                expect(artifacts.type).to.equal('local');
                expect(response.statusCode).to.equal(302);
                var user = server.plugins.tacklebox.getUsers()[0];
                expect(user.name).to.equal('admin');
                expect(user.password.length).to.equal(60);
                done();
            });
        });
    });

    it('POST /view/login valid admin password', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'admin',
                type: 'local',
                password: 'admin'
            };
            server.inject({ method: 'POST', url: '/view/login', payload: payload }, function (response) {

                var artifacts = response.request.auth.artifacts;
                expect(artifacts.name).to.equal('admin');
                expect(artifacts.type).to.equal('local');
                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('POST /view/login invalid admin password', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'admin',
                type: 'local',
                password: 'password'
            };
            server.inject({ method: 'POST', url: '/view/login', payload: payload }, function (response) {

                expect(response.request.auth.artifacts).to.not.exist();
                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/user/{userId}/delete', function (done) {

        internals.prepareServer(function (server) {

            var userId = server.plugins.tacklebox.getUsers()[0].id;
            server.inject({ method: 'GET', url: '/view/user/'+userId+ '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

});
