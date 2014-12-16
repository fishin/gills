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
                var job_id = server.plugins.tacklebox.getJobs()[0].id;
                expect(job_id).to.exist();
                server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {
       
                    expect(response.statusCode).to.equal(200);
                    var updatePayload = { description: "description2" }; 
                    server.inject({ method: 'POST', url: '/gills/job/'+job_id, payload: updatePayload}, function (response) {

                        expect(response.statusCode).to.equal(302);
                        server.inject({ method: 'GET', url: '/gills/jobs'}, function (response) {

                            expect(response.statusCode).to.equal(200);
                            expect(response.result).to.exist();
                            server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/start'}, function (response) {

                                console.log('starting job: ' + job_id);
                                expect(response.statusCode).to.equal(302);
                                var run_id = server.plugins.tacklebox.getRuns(job_id)[0].id;
                                console.log('run_id: ' + run_id);
                                expect(run_id).to.exist(); 
                                server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {
                                    expect(response.statusCode).to.equal(200);
                                });
                                var intervalObj = setInterval(function() {

                                    var run = server.plugins.tacklebox.getRun(job_id, run_id);
                                    if (run.finishTime) {
                                        clearInterval(intervalObj);   
                                        expect(run.finishTime);
                                        expect(run.id);
                                        server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {

                                            expect(response.statusCode).to.equal(200);
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
