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

describe('jobs', function () {    

    it('mixed', function (done) {
        internals.prepareServer(function (server) {

            var payload = {
                name: 'invalid',
                description: 'description',
                body: 'invalid'
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                var jobId1 = server.plugins.tacklebox.getJobs()[0].id;
                expect(jobId1).to.exist();
                server.inject({ method: 'GET', url: '/gills/job/'+jobId1+ '/start'}, function (response) {

                    console.log('starting job: ' + jobId1);
                    expect(response.statusCode).to.equal(302);
                    server.inject({ method: 'GET', url: '/gills/job/'+jobId1}, function (response) {

                        expect(response.statusCode).to.equal(200);
                    });
                    var runId = server.plugins.tacklebox.getRuns(jobId1)[0].id;
                    expect(runId).to.exist(); 
                    var intervalObj1 = setInterval(function() {

                        var run = server.plugins.tacklebox.getRun(jobId1, runId);
                        if (run.finishTime) {

                            clearInterval(intervalObj1);   
                            expect(run.finishTime).to.exist();
                            expect(run.id).to.exist();
                            expect(run.status).to.equal('failed');
                            var payload2 = {
                                name: 'date',
                                description: 'description',
                                body: 'date'
                            };
                            server.inject({ method: 'POST', url: '/gills/job', payload: payload2}, function (response) {
                                expect(response.statusCode).to.equal(302);
                                var jobId2 = server.plugins.tacklebox.getJobs()[1].id;
                                expect(jobId2).to.exist();
                                server.inject({ method: 'GET', url: '/gills/job/'+jobId2+ '/start'}, function (response) {

                                    console.log('starting job: ' + jobId2);
                                    expect(response.statusCode).to.equal(302);
                                    server.inject({ method: 'GET', url: '/gills/job/'+jobId2}, function (response) {

                                        expect(response.statusCode).to.equal(200);
                                    });
                                    var runId = server.plugins.tacklebox.getRuns(jobId2)[0].id;
                                    expect(runId).to.exist(); 
                                    var intervalObj2 = setInterval(function() {

                                        var run = server.plugins.tacklebox.getRun(jobId2, runId);
                                        if (run.finishTime) {

                                            clearInterval(intervalObj2);   
                                            expect(run.finishTime).to.exist();
                                            expect(run.id).to.exist();
                                            expect(run.status).to.equal('succeeded');
                                            server.inject({ method: 'GET', url: '/gills/jobs'}, function (response) {

                                                expect(response.statusCode).to.equal(200);

                                                server.inject({ method: 'GET', url: '/gills/job/'+jobId1+ '/delete'}, function (response) {

                                                    expect(response.statusCode).to.equal(302);
                                                    server.inject({ method: 'GET', url: '/gills/job/'+jobId2+ '/delete'}, function (response) {
                                                        expect(response.statusCode).to.equal(302);
                                                        done();
                                                    });
                                                });
                                            });
                                        };
                                    }, 1000);
                                });
                            });
                        };
                    }, 1000);
                });
            });
        });
    });

});
