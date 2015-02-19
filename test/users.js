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

describe('users', function () {    

    it('GET /view/users', function (done) {

        internals.prepareServer(function (server) {

            var payload1 = {
                name: 'lloyd',
                type: 'local',
                displayName: 'Lloyd Benson',
                email: 'lloyd.benson@gmail.com',
                password: 'password'
            };
            server.inject({ method: 'POST', url: '/view/user', payload: payload1}, function (response) {

                expect(response.statusCode).to.equal(302);
                var userId1 = server.plugins.tacklebox.getUsers()[0].id;
                expect(userId1).to.exist();
                var payload2 = {
                    name: 'backer',
                    type: 'local',
                    displayName: 'Ben Acker',
                    email: 'ben.acker@gmail.com',
                    password: 'password'
                };
                server.inject({ method: 'POST', url: '/view/user', payload: payload2}, function (response) {
                    expect(response.statusCode).to.equal(302);
                    var userId2 = server.plugins.tacklebox.getUsers()[1].id;
                    expect(userId2).to.exist();
                    server.inject({ method: 'GET', url: '/view/users'}, function (response) {

                        expect(response.statusCode).to.equal(200);
                        server.inject({ method: 'GET', url: '/view/user/'+userId1+ '/delete'}, function (response) {

                            expect(response.statusCode).to.equal(302);
                            server.inject({ method: 'GET', url: '/view/user/'+userId2+ '/delete'}, function (response) {
                                expect(response.statusCode).to.equal(302);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
