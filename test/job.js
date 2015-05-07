var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');
var Mock = require('mock');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var internals = {
    defaults: {
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
    });
    callback(server);
};


describe('job', function () {

    it('GET /view/job', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job',
                file: 'empty.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'GET', url: '/view/job' }, function (response) {

                        expect(response.statusCode).to.equal(200);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/job no scm', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'post',
                path: '/api/job',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                var payload = {
                    name: 'name',
                    description: 'description',
                    bodyCommand0: 'date'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'POST', url: '/view/job', payload: payload }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/job scm empty commands', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'post',
                path: '/api/job',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                var payload = {
                    name: 'name',
                    description: 'description',
                    headCommand0: '',
                    bodyCommand0: '',
                    tailCommand0: '',
                    scmType: 'git',
                    scmRunOnCommit: true,
                    scmUrl: 'https://github.com/fishin/pail',
                    scmBranch: 'master'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'POST', url: '/view/job', payload: payload }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/job', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'post',
                path: '/api/job',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                var payload = {
                    name: 'name',
                    description: 'description',
                    headCommand0: 'date',
                    scmType: 'git',
                    scmUrl: 'https://github.com/fishin/pail',
                    scmBranch: 'master',
                    scmPrs: true,
                    notifyType: 'email',
                    notifyTo: 'lloyd.benson@gmail.com',
                    notifySubject: '{jobName} {status}',
                    notifyMessage: 'http://localhost:8080/view/job/{jobId}/run/{runId}',
                    notifyStatusFailed: true,
                    notifyStatusFixed: true,
                    notifyStatusCancelled: true,
                    notifyStatusSucceeded: true,
                    bodyCommand0: 'npm install',
                    bodyCommand1: 'npm test',
                    tailCommand0: 'uptime'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'POST', url: '/view/job', payload: payload }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId} noruns', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/runs',
                file: 'noruns.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId} single run', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/runs',
                file: 'single.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/pids',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/reels',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/queue',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/jobs/active',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId} failed', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/runs',
                file: 'failed.json'
            },
            {
                method: 'get',
                path: '/api/reels',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/queue',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/runs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/pids',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/test/lab.json',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/reels',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/queue',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/jobs/active',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId} pr activeRun', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/prs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/runs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/run/12345678-1234-1234-1234-123456789012/pids',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });


    it('GET /view/job/{jobId} activeRun', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/runs',
                file: 'active.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/pids',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId} no test exists', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/runs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/pids',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/test/lab.json',
                file: 'null'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId} full', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789013',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789013/runs',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789013';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/jobs', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/jobs',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/byname/last',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789014/run/byname/last',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'GET', url: '/view/jobs' }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/job/{jobId}', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'put',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                var payload = {
                    description: 'description2',
                    headCommand0: 'date',
                    bodyCommand0: 'npm install',
                    tailCommand0: 'bin/tail.sh'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'POST', url: '/view/job/' + jobId, payload: payload }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/start', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/start',
                file: 'empty.txt'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/start' }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/commits', function (done) {

        var type = 'tacklebox';
        // need jobId to add repoUrl maybe add this right in bobber
        var routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/commits',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/commits' }, function (response) {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain('lloyd');
                        expect(response.result).to.contain('github.com');
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/workspace/delete', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'delete',
                path: '/api/job/12345678-1234-1234-1234-123456789012/workspace/delete',
                file: 'empty.txt'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    var jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/workspace/delete' }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/delete', function (done) {

        var type = 'tacklebox';
        var routes = [
            {
                method: 'delete',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'empty.txt'
            }
        ];
        Mock.prepareServer(type, routes, function (mockServer) {

            mockServer.start(function () {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer(function (server) {

                    server.inject({ method: 'GET', url: '/view/job/12345678-1234-1234-1234-123456789012/delete' }, function (response) {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });
});
