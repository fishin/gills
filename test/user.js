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

    it('POST /gills/user', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                username: 'lloyd',
                name: 'Lloyd Benson1',
                email: 'lloyd.benson@gmail.com'
            };
            server.inject({ method: 'POST', url: '/gills/user', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /gills/user/{userId}', function (done) {

        internals.prepareServer(function (server) {

            var userId = server.plugins.tacklebox.getUsers()[0].id;
            server.inject({ method: 'GET', url: '/gills/user/'+userId}, function (response) {
       
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('POST /gills/user/{userId}', function (done) {

        internals.prepareServer(function (server) {

            var userId = server.plugins.tacklebox.getUsers()[0].id;
            var updatePayload = { name: "Lloyd Benson" }; 
            server.inject({ method: 'POST', url: '/gills/user/'+userId, payload: updatePayload}, function (response) {

                expect(response.statusCode).to.equal(302);
                server.inject({ method: 'GET', url: '/gills/user'}, function (response) {

                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });
        });
    });

    it('GET /gills/user/{userId}/delete', function (done) {

        internals.prepareServer(function (server) {

            var userId = server.plugins.tacklebox.getUsers()[0].id;
            server.inject({ method: 'GET', url: '/gills/user/'+userId+ '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

});
