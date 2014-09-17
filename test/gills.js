var Lab = require('lab');
var Hapi = require('hapi');

var lab = exports.lab = Lab.script();
var expect = Lab.expect;
var before = lab.before;
var after = lab.after;
var describe = lab.describe;
var it = lab.it;

var internals = {};

internals.prepareServer = function (callback) {
    var server = new Hapi.Server();

    server.pack.register({

        plugin: require('..')
    }, function (err) {

        expect(err).to.not.exist;
        callback(server);
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


    it('gills crud flow', function (done) {
        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                head: 'npm install',
                body: 'npm test',
                tail: ''
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                var location = response.headers.location.split('/');
                var job_id = location[location.length-1];
                server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {
       
                    expect(response.statusCode).to.equal(200);
                    var updatePayload = { description: "description2" }; 
                    server.inject({ method: 'POST', url: '/gills/job/'+job_id, payload: updatePayload}, function (response) {

                        expect(response.statusCode).to.equal(302);
                        server.inject({ method: 'GET', url: '/gills/jobs'}, function (response) {

                            expect(response.statusCode).to.equal(200);
                            expect(response.result).to.exist;
                            server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/delete'}, function (response) {

                                expect(response.statusCode).to.equal(302);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });


    it('gills new job', function (done) {
        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/gills/job/create'}, function (response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.exist;
                done();
            });
        });
    });

});
