var Lab = require('lab');
var Hapi = require('hapi');
var Tacklebox = require('tacklebox');

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
        server.pack.register({

            plugin: require('tacklebox')
        }, function (err) {

            expect(err).to.not.exist;
            callback(server);
        });
   });
};

describe('', function () {    

    it('redirect /', function (done) {
        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('gills jobs', function (done) {
        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/gills/jobs'}, function (response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.exist;
                done();
            });
        });
    });

    it('gills create job', function (done) {
        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/gills/job'}, function (response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.exist;
                done();
            });
        });
    });

    it('gills update job', function (done) {
        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/gills/job/1001'}, function (response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.exist;
                done();
            });
        });
    });

});
