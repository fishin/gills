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

describe('redirect', function () {

    it('GET /', function (done) {

        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });
});
