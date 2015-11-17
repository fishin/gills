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


describe('queue', () => {

    it('GET /view/queue/{jobId}/add', (done) => {

        const jobId = '12345678-1234-1234-1234-123456789012';
        const type = 'tacklebox';
        const routes = [
            {
                method: 'post',
                path: '/api/queue',
                file: 'null'
            },
            {
                method: 'get',
                path: '/api/queue',
                file: 'jobs.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'GET', url: '/view/queue/' + jobId + '/add' }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/queue/{jobId}/remove', (done) => {

        const jobId = '12345678-1234-1234-1234-123456789012';
        const type = 'tacklebox';
        const routes = [
            {
                method: 'delete',
                path: '/api/queue/' + jobId,
                file: 'null'
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

                    server.inject({ method: 'GET', url: '/view/queue/' + jobId + '/remove' }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/queue/clear', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'delete',
                path: '/api/queue',
                file: 'null'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'GET', url: '/view/queue/clear' }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/queue/{jobId}/pr/{number}/remove', (done) => {

        const jobId = '12345678-1234-1234-1234-123456789012';
        const type = 'tacklebox';
        const routes = [
            {
                method: 'delete',
                path: '/api/queue/' + jobId + '/pr/1',
                file: 'null'
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

                    server.inject({ method: 'GET', url: '/view/queue/' + jobId + '/pr/1/remove' }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });
});
