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


describe('run', () => {

    it('GET /view/job/{jobId}/run/{runId}', (done) => {

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
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/archive',
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
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/run/' + runId }, (response) => {

                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        expect(response.result).to.contain(runId);
                        expect(response.result).to.contain('<input type="text" class="form-control" id="inputRunId" placeholder="succeeded" disabled>');
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/run/{runId} single', (done) => {

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
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012',
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
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/run/' + runId }, (response) => {

                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(jobId);
                        expect(response.result).to.contain(runId);
                        expect(response.result).to.contain('<input type="text" class="form-control" id="inputRunId" placeholder="succeeded" disabled>');
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/run/{runId}/cancel', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'delete',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/cancel',
                file: 'empty.txt'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789012';
                    const runId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/run/' + runId + '/cancel' }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/run/{runId}/delete', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'delete',
                path: '/api/job/12345678-1234-1234-1234-123456789012/run/12345678-1234-1234-1234-123456789012/delete',
                file: 'empty.txt'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789012';
                    const runId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/run/' + runId + '/delete' }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/job/{jobId}/runs/delete', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'delete',
                path: '/api/job/12345678-1234-1234-1234-123456789012/runs/delete',
                file: 'empty.txt'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.prepareServer((server) => {

                    const jobId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/job/' + jobId + '/runs/delete' }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });
});
