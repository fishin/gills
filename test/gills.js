var Lab = require('lab');
var Hapi = require('hapi');

var lab = exports.lab = Lab.script();
var expect = Lab.expect;
var before = lab.before;
var after = lab.after;
var describe = lab.describe;
var it = lab.it;

var internals = {
    defaults: {
        apiPath: '/gills',
        job: {
            pailPath: '/tmp/testgills/job',
            workspace: 'workspace',
            configFile: 'config.json'
        },
        run: {
            pailPath: '/tmp/testgills/run',
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
                scm_type: 'git',
                scm_url: 'https://github.com/fishin/pail',
                scm_branch: 'master',
                head: 'npm install',
                body: 'npm test',
                tail: ''
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                var job_id = server.plugins.tacklebox.getJobs()[0];
                expect(job_id).to.exist;
                server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {
       
                    expect(response.statusCode).to.equal(200);
                    var updatePayload = { description: "description2" }; 
                    server.inject({ method: 'POST', url: '/gills/job/'+job_id, payload: updatePayload}, function (response) {

                        expect(response.statusCode).to.equal(302);
                        server.inject({ method: 'GET', url: '/gills/jobs'}, function (response) {

                            expect(response.statusCode).to.equal(200);
                            expect(response.result).to.exist;
                            server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/run'}, function (response) {

                                expect(response.statusCode).to.equal(302);
                                server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {

                                    expect(response.statusCode).to.equal(200);
                                    var run_id = server.plugins.tacklebox.getRuns(job_id)[0];
                                    expect(run_id).to.exist; 
                                    server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/run/' + run_id}, function (response) {

                                        expect(response.statusCode).to.equal(200);
                                        server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/run/' + run_id + '/delete'}, function (response) {

                                            expect(response.statusCode).to.equal(302);
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
                });
            });
        });
    });

    it('gills failed run', function (done) {
        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                head: 'invalid'
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                var job_id = server.plugins.tacklebox.getJobs()[0];
                expect(job_id).to.exist;
                server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/run'}, function (response) {

                    expect(response.statusCode).to.equal(302);
                    var run_id = server.plugins.tacklebox.getRuns(job_id)[0];
                    expect(run_id).to.exist;
                    server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {
                        
                        expect(response.statusCode).to.equal(200);
                        server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/delete'}, function (response) {

                            expect(response.statusCode).to.equal(302);
                            done();
                        });
                    });
                });
            });
        });
    });

    it('gills job create form', function (done) {
        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/gills/job/create'}, function (response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.exist;
                done();
            });
        });
    });

    it('gills reel create form', function (done) {
        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/gills/reel/create'}, function (response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.exist;
                done();
            });
        });
    });

    it('gills reel crud flow', function (done) {
        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description'
            };
            server.inject({ method: 'POST', url: '/gills/reel', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                var reel_id = server.plugins.tacklebox.getReels()[0];
                expect(reel_id).to.exist;
                server.inject({ method: 'GET', url: '/gills/reel/'+reel_id}, function (response) {
       
                    expect(response.statusCode).to.equal(200);
                    var updatePayload = { description: "description2" }; 
                    server.inject({ method: 'POST', url: '/gills/reel/'+reel_id, payload: updatePayload}, function (response) {

                        expect(response.statusCode).to.equal(302);
                        server.inject({ method: 'GET', url: '/gills/jobs'}, function (response) {

                            expect(response.statusCode).to.equal(200);
                            expect(response.result).to.exist;
                            var payload = {
                                name: 'name',
                                description: 'description',
                                body: 'date'
                            };
                            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                                expect(response.statusCode).to.equal(302);
                                var job_id = server.plugins.tacklebox.getJobs()[0];
                                expect(job_id).to.exist;
                                server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {
       
                                    expect(response.statusCode).to.equal(200);
                                    server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/delete'}, function (response) {

                                        expect(response.statusCode).to.equal(302);
                                        server.inject({ method: 'GET', url: '/gills/reel/'+reel_id+ '/delete'}, function (response) {

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
