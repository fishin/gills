var Lab = require('lab');
var Hapi = require('hapi');

var internals = {};

var lab = exports.lab = Lab.script();
var expect = Lab.expect;
var before = lab.before;
var after = lab.after;
var describe = lab.describe;
var it = lab.it;

internals.prepareServer = function (callback) {
    var server = new Hapi.Server();

    server.pack.register({

        plugin: require('..')
    }, function (err) {

        expect(err).to.not.exist;
        callback(server);
    });
};

describe('ui', function () {    

    it('hello world', function (done) {
        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/ui'}, function (response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.equal('hello world');
                done();
            });
        });
    });

});
