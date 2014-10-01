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

        expect(err).to.not.exist;
        callback(server);
   });
};

describe('run', function () {    

    it('failed', function (done) {
        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                head: 'invalid'
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                var job_id = server.plugins.tacklebox.getJobs()[0].id;
                expect(job_id).to.exist;
                server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/start'}, function (response) {
                    
                    console.log('starting job: ' + job_id);
                    //expect(response.statusCode).to.equal(302);
                    var run_id = server.plugins.tacklebox.getRuns(job_id)[0].id;
                    expect(run_id).to.exist; 
                    var intervalObj = setInterval(function() {

                        var run = server.plugins.tacklebox.getRun(job_id, run_id);
                        if (run.finishTime) {
                            clearInterval(intervalObj);
                            expect(run.finishTime).to.exist;
                            expect(run.status).to.equal('failed');
                            server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {
                        
                                expect(response.statusCode).to.equal(200);
                                server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/delete'}, function (response) {

                                    expect(response.statusCode).to.equal(302);
                                    done();
                                });
                            });
                        }
                    }, 1000);
                });
            });
        });
    });

    it('cancelled', function (done) {
        internals.prepareServer(function (server) {

            var payload = {
                name: 'cancel',
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
                expect(job_id).to.exist;
                server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/start'}, function (response) {
                    
                    console.log('starting job: ' + job_id);
                    //expect(response.statusCode).to.equal(302);
                    var run_id = server.plugins.tacklebox.getRuns(job_id)[0].id;
                    expect(run_id).to.exist; 
                    server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/run/' + run_id + '/cancel'}, function (response) {
                        expect(response.statusCode).to.equal(302);
                    
                        var intervalObj = setInterval(function() {

                            var run = server.plugins.tacklebox.getRun(job_id, run_id);
                            if (run.finishTime) {
                                clearInterval(intervalObj);
                                expect(run.finishTime).to.exist;
                                expect(run.status).to.equal('cancelled');
                                server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {
                        
                                    expect(response.statusCode).to.equal(200);
                                    server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/delete'}, function (response) {

                                        expect(response.statusCode).to.equal(302);
                                        done();
                                    });
                                });
                            }
                        }, 1000);
                    });
                });
            });
        });
    });

});
