'use strict';

const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');
const Mock = require('mock');

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

const internals = {
    defaults: {
    }
};

internals.prepareServer = function (callback) {

    const server = new Hapi.Server();
    server.connection();

    server.register({
        register: require('..'),
        options: internals.defaults
    }, (err) => {

        expect(err).to.not.exist();
    });
    callback(server);
};


describe('job', () => {

    it('GET /view/job', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/job',
                file: 'empty.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'GET', url: '/view/job' }, (response) => {

                        expect(response.statusCode).to.equal(200);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/job no scm', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'post',
                path: '/api/job',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                const payload = {
                    name: 'name',
                    description: 'description',
                    installCommand: 'date'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'POST', url: '/view/job', payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/job scm empty commands', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'post',
                path: '/api/job',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                const payload = {
                    name: 'name',
                    description: 'description',
                    headCommand0: '',
                    installCommand: '',
                    tailCommand0: '',
                    scmType: 'git',
                    scmRunOnCommit: true,
                    scmUrl: 'https://github.com/fishin/pail',
                    scmBranch: 'master'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'POST', url: '/view/job', payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/job', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'post',
                path: '/api/job',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                const payload = {
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
                    installCommand: 'npm install',
                    testCommand: 'npm test',
                    tailCommand0: 'uptime'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'POST', url: '/view/job', payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId} noruns', (done) => {

        const type = 'tacklebox';
        const routes = [
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
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId} single run', (done) => {

        const type = 'tacklebox';
        const routes = [
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
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId} failed', (done) => {

        const type = 'tacklebox';
        const routes = [
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
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}', (done) => {

        const type = 'tacklebox';
        const routes = [
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
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/test',
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
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId} pr activeRun', (done) => {

        const type = 'tacklebox';
        const routes = [
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
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });


    it('GET /view/job/{jobId} activeRun', (done) => {

        const type = 'tacklebox';
        const routes = [
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
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId} no test exists', (done) => {

        const type = 'tacklebox';
        const routes = [
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
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/test',
                file: 'null'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId} full', (done) => {

        const type = 'tacklebox';
        const routes = [
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
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789013';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/jobs', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/jobs/stats',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'GET', url: '/view/jobs' }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/job/{jobId}', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'put',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                const payload = {
                    description: 'description2',
                    headCommand0: 'date',
                    installCommand: 'npm install',
                    tailCommand0: 'bin/tail.sh'
                };
                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'POST', url: '/view/job/' + jobId, payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/commits', (done) => {

        const type = 'tacklebox';
        // need jobId to add repoUrl maybe add this right in bobber
        const routes = [
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
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/commits' }, (response) => {

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

    it('GET /view/job/{jobId}/workspace/delete', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'delete',
                path: '/api/job/12345678-1234-1234-1234-123456789012/workspace/delete',
                file: 'empty.txt'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/workspace/delete' }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/delete', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'delete',
                path: '/api/job/12345678-1234-1234-1234-123456789012',
                file: 'empty.txt'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'GET', url: '/view/job/12345678-1234-1234-1234-123456789012/delete' }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });
});
