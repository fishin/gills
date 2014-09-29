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
                            server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/start'}, function (response) {

                                console.log('starting job: ' + job_id);
                                expect(response.statusCode).to.equal(302);
                                var run_id = server.plugins.tacklebox.getRuns(job_id)[0].id;
                                expect(run_id).to.exist; 
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

    it('gills cancelled run', function (done) {
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
                var job_id = server.plugins.tacklebox.getJobs()[0];
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
                                    server.inject({ method: 'GET', url: '/gills/job'}, function (response) {

                                        //console.log(response);
                                        expect(response.statusCode).to.equal(200);
                                        server.inject({ method: 'GET', url: '/gills/reel'}, function (response) {

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
    });

    it('gills multiple runs', function (done) {
        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                body: 'date'
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                var job_id = server.plugins.tacklebox.getJobs()[0];
                expect(job_id).to.exist;
                server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/start'}, function (response) {

                    console.log('starting job: ' + job_id);
                    expect(response.statusCode).to.equal(302);
                    server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {

                        expect(response.statusCode).to.equal(200);
                    });
                    var run_id1 = server.plugins.tacklebox.getRuns(job_id)[0].id;
                    expect(run_id1).to.exist; 
                    var intervalObj = setInterval(function() {

                        var run1 = server.plugins.tacklebox.getRun(job_id, run_id1);
                        if (run1.finishTime) {

                            clearInterval(intervalObj);   
                            expect(run1.finishTime).to.exist;
                            expect(run1.id).to.exist;
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
                                    expect(run_id2).to.exist; 
                                    var intervalObj = setInterval(function() {

                                        var run2 = server.plugins.tacklebox.getRun(job_id, run_id2);
                                        if (run2.finishTime) {

                                            clearInterval(intervalObj);   
                                            expect(run2.finishTime).to.exist;
                                            expect(run2.id).to.exist;
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
                                                    expect(run_id3).to.exist; 
                                                    var intervalObj = setInterval(function() {

                                                        var run3 = server.plugins.tacklebox.getRun(job_id, run_id3);
                                                        if (run3.finishTime) {

                                                            clearInterval(intervalObj);   
                                                            expect(run3.finishTime).to.exist;
                                                            expect(run3.id).to.exist;
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

    it('gills refresh runs', function (done) {
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
                server.inject({ method: 'GET', url: '/gills/job/'+job_id+ '/start'}, function (response) {

                    console.log('starting job: ' + job_id);
                    expect(response.statusCode).to.equal(302);
                    server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {

                        expect(response.statusCode).to.equal(200);
                    });
                    var run_id = server.plugins.tacklebox.getRuns(job_id)[0].id;
                    expect(run_id).to.exist; 
                    var begin = new Date().getTime();
                    var intervalObj = setInterval(function() {

                        server.inject({ method: 'GET', url: '/gills/job/'+job_id}, function (response) {

                            expect(response.statusCode).to.equal(200);
                        });
                        var run = server.plugins.tacklebox.getRun(job_id, run_id);
                        if (run.finishTime) {

                            clearInterval(intervalObj);   
                            expect(run.finishTime).to.exist;
                            expect(run.id).to.exist;
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
