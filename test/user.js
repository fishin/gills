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

    it('POST /view/user', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'lloyd',
                displayName: 'Lloyd Benson1',
                email: 'lloyd.benson@gmail.com'
            };
            server.inject({ method: 'POST', url: '/view/user', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
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
            var updatePayload = { displayName: "Lloyd Benson" }; 
            server.inject({ method: 'POST', url: '/view/user/'+userId, payload: updatePayload}, function (response) {

                expect(response.statusCode).to.equal(302);
                server.inject({ method: 'GET', url: '/view/user'}, function (response) {

                    expect(response.statusCode).to.equal(200);
                    done();
                });
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
