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

describe('prs', () => {

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
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/2/runs',
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
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/run/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/2/run/12345678-1234-1234-1234-123456789012',
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

    it('GET /view/job/{jobId} active', (done) => {

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
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/2/runs',
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
                path: '/api/prs/active',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/run/12345678-1234-1234-1234-123456789012',
                file: 'active.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/2/run/12345678-1234-1234-1234-123456789012',
                file: 'active.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/byname/lastSuccess',
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

    it('GET /view/job/{jobId} active long', (done) => {

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
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/2/runs',
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
                path: '/api/prs/active',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/run/12345678-1234-1234-1234-123456789012',
                file: 'active.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/2/run/12345678-1234-1234-1234-123456789012',
                file: 'active.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/byname/lastSuccess',
                file: 'long.json'
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

    it('GET /view/job/{jobId} api issues', (done) => {

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
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/2/runs',
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
                path: '/api/prs/active',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/run/12345678-1234-1234-1234-123456789012',
                file: 'active.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/2/run/12345678-1234-1234-1234-123456789012',
                file: '404'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/byname/lastSucess',
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
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId} no run', (done) => {

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
            },
            {
                method: 'get',
                path: '/api/prs/active',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/run/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/2/run/12345678-1234-1234-1234-123456789012',
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

    it('GET /view/job/{jobId}/pr/{number}/merge', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/merge',
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
                    server.ext('onPreResponse', (request, reply) => {

                        request.auth.session.set({

                            userId: 1,
                            name: 'lloyd',
                            token: 'secrettoken',
                            displayName: 'Lloyd Benson',
                            url: 'http://lloydbenson.com',
                            type: 'github'
                        });
                        reply.continue();
                    });
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/pr/1/merge' }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/pr/{number}/merge failed', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/merge',
                file: 'failed.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789012';
                    server.ext('onPreResponse', (request, reply) => {

                        request.auth.session.set({

                            userId: 1,
                            name: 'lloyd',
                            token: 'secrettoken',
                            displayName: 'Lloyd Benson',
                            url: 'http://lloydbenson.com',
                            type: 'github'
                        });
                        reply.continue();
                    });
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/pr/1/merge' }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/pr/{number}/start', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/start',
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
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/pr/1/start' }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/pr/{number}/retry', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/retry',
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
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/pr/1/retry' }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/pr/1/run/{runId}', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/run/12345678-1234-1234-1234-123456789012',
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
                    const runId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/pr/1/run/' + runId }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/pr/1/cancel', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/pr/1/run/12345678-1234-1234-1234-123456789012/cancel',
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
                    const runId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/pr/1/run/' + runId + '/cancel' }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });
});
