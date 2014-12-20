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

describe('reel', function () {    

    it('crud flow', function (done) {
        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description'
            };
            server.inject({ method: 'POST', url: '/gills/reel', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                var reelId = server.plugins.tacklebox.getReels()[0].id;
                expect(reelId).to.exist();
                server.inject({ method: 'GET', url: '/gills/reel/'+reelId}, function (response) {
       
                    expect(response.statusCode).to.equal(200);
                    var updatePayload = { description: "description2" }; 
                    server.inject({ method: 'POST', url: '/gills/reel/'+reelId, payload: updatePayload}, function (response) {

                        expect(response.statusCode).to.equal(302);
                        server.inject({ method: 'GET', url: '/gills/jobs'}, function (response) {

                            expect(response.statusCode).to.equal(200);
                            expect(response.result).to.exist();
                            var payload = {
                                name: 'name',
                                description: 'description',
                                body: 'date'
                            };
                            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                                expect(response.statusCode).to.equal(302);
                                var jobId = server.plugins.tacklebox.getJobs()[0].id;
                                expect(jobId).to.exist();
                                server.inject({ method: 'GET', url: '/gills/job/'+jobId}, function (response) {
       
                                    expect(response.statusCode).to.equal(200);
                                    server.inject({ method: 'GET', url: '/gills/job'}, function (response) {

                                        //console.log(response);
                                        expect(response.statusCode).to.equal(200);
                                        server.inject({ method: 'GET', url: '/gills/reel'}, function (response) {

                                            expect(response.statusCode).to.equal(200);
                                            server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/delete'}, function (response) {

                                                expect(response.statusCode).to.equal(302);
                                                server.inject({ method: 'GET', url: '/gills/reel/'+reelId+ '/delete'}, function (response) {

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
                });
            });
        });
    });

});
