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

describe('job', function () {    

    it('crud flow', function (done) {
        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                scm_type: 'git',
                scm_url: 'https://github.com/fishin/pail',
                scm_branch: 'master',
                head: 'npm install',
                body: 'npm test',
                tail: ''
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                var jobId = server.plugins.tacklebox.getJobs()[0].id;
                expect(jobId).to.exist();
                server.inject({ method: 'GET', url: '/gills/job/'+jobId}, function (response) {
       
                    expect(response.statusCode).to.equal(200);
                    var updatePayload = { description: "description2" }; 
                    server.inject({ method: 'POST', url: '/gills/job/'+jobId, payload: updatePayload}, function (response) {

                        expect(response.statusCode).to.equal(302);
                        server.inject({ method: 'GET', url: '/gills/jobs'}, function (response) {

                            expect(response.statusCode).to.equal(200);
                            expect(response.result).to.exist();
                            server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/start'}, function (response) {

                                console.log('starting job: ' + jobId);
                                expect(response.statusCode).to.equal(302);
                                var runId = server.plugins.tacklebox.getRuns(jobId)[0].id;
                                console.log('runId: ' + runId);
                                expect(runId).to.exist(); 
                                server.inject({ method: 'GET', url: '/gills/job/'+jobId}, function (response) {
                                    expect(response.statusCode).to.equal(200);
                                });
                                var intervalObj = setInterval(function() {

                                    var run = server.plugins.tacklebox.getRun(jobId, runId);
                                    if (run.finishTime) {
                                        clearInterval(intervalObj);   
                                        expect(run.finishTime);
                                        expect(run.id);
                                        server.inject({ method: 'GET', url: '/gills/job/'+jobId}, function (response) {

                                            expect(response.statusCode).to.equal(200);
                                            server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/run/' + runId}, function (response) {

                                                expect(response.statusCode).to.equal(200);
                                                server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/run/' + runId + '/delete'}, function (response) {

                                                    expect(response.statusCode).to.equal(302);
                                                    server.inject({ method: 'GET', url: '/gills/job/'+jobId+ '/delete'}, function (response) {

                                                        expect(response.statusCode).to.equal(302);
                                                        done();
                                                    });
                                                });
                                            });
                                        });
                                    };
                                }, 1000);
                            });
                        });
                    });
                });
            });
        });
    });

});
