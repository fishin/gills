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

    server.pack.register({
        plugin: require('..'),
        options: internals.defaults
    }, function (err) {

        expect(err).to.not.exist();
        callback(server);
   });
};

describe('runs', function () {    

    it('mixed', function (done) {
        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                body: 'date'
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                var job_id = server.plugins.tacklebox.getJobs()[0].id;
                expect(job_id).to.exist();
                server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/start'}, function (response) {

                    console.log('starting job: ' + job_id);
                    expect(response.statusCode).to.equal(302);
                    server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {

                        expect(response.statusCode).to.equal(200);
                    });
                    var run_id1 = server.plugins.tacklebox.getRuns(job_id)[0].id;
                    expect(run_id1).to.exist(); 
                    var intervalObj = setInterval(function() {

                        var run1 = server.plugins.tacklebox.getRun(job_id, run_id1);
                        if (run1.finishTime) {

                            clearInterval(intervalObj);   
                            expect(run1.finishTime).to.exist();
                            expect(run1.id).to.exist();
                            expect(run1.status).to.equal('succeeded');
                            var updatePayload = { body: 'invalid' }; 
                            server.inject({ method: 'POST', url: '/gills/job/'+job_id, payload: updatePayload}, function (response) {
                                expect(response.statusCode).to.equal(302);
                                server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/start'}, function (response) {

                                    console.log('starting job: ' + job_id);
                                    expect(response.statusCode).to.equal(302);
                                    server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {

                                        expect(response.statusCode).to.equal(200);
                                    });
                                    var run_id2 = server.plugins.tacklebox.getRuns(job_id)[0].id;
                                    expect(run_id2).to.exist(); 
                                    var intervalObj = setInterval(function() {

                                        var run2 = server.plugins.tacklebox.getRun(job_id, run_id2);
                                        if (run2.finishTime) {

                                            clearInterval(intervalObj);   
                                            expect(run2.finishTime).to.exist();
                                            expect(run2.id).to.exist();
                                            expect(run2.status).to.equal('failed');
                                            var updatePayload2 = { body: 'date' }; 
                                            server.inject({ method: 'POST', url: '/gills/job/'+job_id, payload: updatePayload2}, function (response) {
                                                expect(response.statusCode).to.equal(302);
                                                server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/start'}, function (response) {

                                                    console.log('starting job: ' + job_id);
                                                    expect(response.statusCode).to.equal(302);
                                                    server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {

                                                        expect(response.statusCode).to.equal(200);
                                                    });
                                                    var run_id3 = server.plugins.tacklebox.getRuns(job_id)[0].id;
                                                    expect(run_id3).to.exist(); 
                                                    var intervalObj = setInterval(function() {

                                                        var run3 = server.plugins.tacklebox.getRun(job_id, run_id3);
                                                        if (run3.finishTime) {

                                                            clearInterval(intervalObj);   
                                                            expect(run3.finishTime).to.exist();
                                                            expect(run3.id).to.exist();
                                                            expect(run3.status).to.equal('succeeded');
                                                            server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/delete'}, function (response) {

                                                                expect(response.statusCode).to.equal(302);
                                                                done();
                                                            });
                                                        };
                                                    }, 1000);
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

    it('refresh', function (done) {
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
                var job_id = server.plugins.tacklebox.getJobs()[0].id;
                expect(job_id).to.exist();
                server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/start'}, function (response) {

                    console.log('starting job: ' + job_id);
                    expect(response.statusCode).to.equal(302);
                    server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {

                        expect(response.statusCode).to.equal(200);
                    });
                    var run_id = server.plugins.tacklebox.getRuns(job_id)[0].id;
                    expect(run_id).to.exist(); 
                    var begin = new Date().getTime();
                    var intervalObj = setInterval(function() {

                        server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {

                            expect(response.statusCode).to.equal(200);
                        });
                        var run = server.plugins.tacklebox.getRun(job_id, run_id);
                        if (run.finishTime) {

                            clearInterval(intervalObj);   
                            expect(run.finishTime).to.exist();
                            expect(run.id).to.exist();
                            expect(run.status).to.equal('succeeded');
                            server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/delete'}, function (response) {

                                expect(response.statusCode).to.equal(302);
                                done();
                            });
                        };
                    }, 1000);
                });
            });
        });
    });

});
