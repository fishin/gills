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

    it('crud flow', function (done) {
        internals.prepareServer(function (server) {

            var payload = {
                name: 'lloyd',
                displayName: 'Lloyd Benson1',
                email: 'lloyd.benson@gmail.com'
            };
            server.inject({ method: 'POST', url: '/gills/user', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                var userId = server.plugins.tacklebox.getUsers()[0].id;
                expect(userId).to.exist();
                server.inject({ method: 'GET', url: '/gills/user/'+userId}, function (response) {
       
                    expect(response.statusCode).to.equal(200);
                    var updatePayload = { displayName: "Lloyd Benson" }; 
                    server.inject({ method: 'POST', url: '/gills/user/'+userId, payload: updatePayload}, function (response) {

                        expect(response.statusCode).to.equal(302);
                        server.inject({ method: 'GET', url: '/gills/user'}, function (response) {

                            expect(response.statusCode).to.equal(200);
                            server.inject({ method: 'GET', url: '/gills/user/'+userId+ '/delete'}, function (response) {

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
