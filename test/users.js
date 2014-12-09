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
            dirpath: '/tmp/testgills/job',
            workspace: 'workspace',
            configFile: 'config.json'
        },
        run: {
//            dirpath: '/tmp/testgills/run',
            workspace: 'workspace',
            configFile: 'config.json'
        },
        user: {
            dirpath: '/tmp/testgills/user',
            workspace: 'workspace',
            configFile: 'config.json'
        },
        reel: {
            dirpath: '/tmp/testgills/reel',
            workspace: 'workspace',
            configFile: 'config.json'
        }
    }
};

internals.prepareServer = function (callback) {

    var server = new Hapi.Server();

    server.pack.register({
        plugin: require('..'),
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
                name: 'lloyd',
                displayName: 'Lloyd Benson',
                email: 'lloyd.benson@gmail.com'
            };
            server.inject({ method: 'POST', url: '/gills/user', payload: payload1}, function (response) {

                expect(response.statusCode).to.equal(302);
                var user_id1 = server.plugins.tacklebox.getUsers()[0].id;
                expect(user_id1).to.exist();
                var payload2 = {
                    name: 'backer',
                    displayName: 'Ben Acker',
                    email: 'ben.acker@gmail.com'
                };
                server.inject({ method: 'POST', url: '/gills/user', payload: payload2}, function (response) {
                    expect(response.statusCode).to.equal(302);
                    var user_id2 = server.plugins.tacklebox.getUsers()[1].id;
                    expect(user_id2).to.exist();
                    server.inject({ method: 'GET', url: '/gills/users'}, function (response) {

                        expect(response.statusCode).to.equal(200);
                        expect(response.statusCode).to.equal(200);
                        server.inject({ method: 'GET', url: '/gills/user/'+user_id1+ '/delete'}, function (response) {

                            expect(response.statusCode).to.equal(302);
                            server.inject({ method: 'GET', url: '/gills/user/'+user_id2+ '/delete'}, function (response) {
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
