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
                var job_id1 = server.plugins.tacklebox.getJobs()[0].id;
                expect(job_id1).to.exist();
                server.inject({ method: 'GET', url: '/gills/job/'+job_id1+ '/start'}, function (response) {

                    console.log('starting job: ' + job_id1);
                    expect(response.statusCode).to.equal(302);
                    server.inject({ method: 'GET', url: '/gills/job/'+job_id1}, function (response) {

                        expect(response.statusCode).to.equal(200);
                    });
                    var run_id = server.plugins.tacklebox.getRuns(job_id1)[0].id;
                    expect(run_id).to.exist(); 
                    var intervalObj1 = setInterval(function() {

                        var run = server.plugins.tacklebox.getRun(job_id1, run_id);
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
                                var job_id2 = server.plugins.tacklebox.getJobs()[1].id;
                                expect(job_id2).to.exist();
                                server.inject({ method: 'GET', url: '/gills/job/'+job_id2+ '/start'}, function (response) {

                                    console.log('starting job: ' + job_id2);
                                    expect(response.statusCode).to.equal(302);
                                    server.inject({ method: 'GET', url: '/gills/job/'+job_id2}, function (response) {

                                        expect(response.statusCode).to.equal(200);
                                    });
                                    var run_id = server.plugins.tacklebox.getRuns(job_id2)[0].id;
                                    expect(run_id).to.exist(); 
                                    var intervalObj2 = setInterval(function() {

                                        var run = server.plugins.tacklebox.getRun(job_id2, run_id);
                                        if (run.finishTime) {

                                            clearInterval(intervalObj2);   
                                            expect(run.finishTime).to.exist();
                                            expect(run.id).to.exist();
                                            expect(run.status).to.equal('succeeded');
                                            server.inject({ method: 'GET', url: '/gills/jobs'}, function (response) {

                                                expect(response.statusCode).to.equal(200);

                                                server.inject({ method: 'GET', url: '/gills/job/'+job_id1+ '/delete'}, function (response) {

                                                    expect(response.statusCode).to.equal(302);
                                                    server.inject({ method: 'GET', url: '/gills/job/'+job_id2+ '/delete'}, function (response) {
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
