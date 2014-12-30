var Code = require('code');
var Lab = require('lab');
var Hapi = require('hapi');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var internals = {
    defaults: {
        apiPath: '/gills',
        job: {
            dirpath: '/tmp/testgills/job'
        },
        user: {
            dirpath: '/tmp/testgills/user'
        },
        reel: {
            dirpath: '/tmp/testgills/reel'
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

    it('GET /gills/users', function (done) {

        internals.prepareServer(function (server) {

            var payload1 = {
                username: 'lloyd',
                name: 'Lloyd Benson',
                email: 'lloyd.benson@gmail.com'
            };
            server.inject({ method: 'POST', url: '/gills/user', payload: payload1}, function (response) {

                expect(response.statusCode).to.equal(302);
                var userId1 = server.plugins.tacklebox.getUsers()[0].id;
                expect(userId1).to.exist();
                var payload2 = {
                    username: 'backer',
                    name: 'Ben Acker',
                    email: 'ben.acker@gmail.com'
                };
                server.inject({ method: 'POST', url: '/gills/user', payload: payload2}, function (response) {
                    expect(response.statusCode).to.equal(302);
                    var userId2 = server.plugins.tacklebox.getUsers()[1].id;
                    expect(userId2).to.exist();
                    server.inject({ method: 'GET', url: '/gills/users'}, function (response) {

                        expect(response.statusCode).to.equal(200);
                        server.inject({ method: 'GET', url: '/gills/user/'+userId1+ '/delete'}, function (response) {

                            expect(response.statusCode).to.equal(302);
                            server.inject({ method: 'GET', url: '/gills/user/'+userId2+ '/delete'}, function (response) {
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
