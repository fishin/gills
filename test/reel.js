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


describe('reel', () => {

    it('GET /view/reel', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/reel',
                file: 'empty.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'GET', url: '/view/reel' }, (response) => {

                        expect(response.statusCode).to.equal(200);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/reel', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'post',
                path: '/api/reel',
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
                    host: 'localhost',
                    port: 8081,
                    size: 2
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'POST', url: '/view/reel', payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/reel/{reelId}', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/reels',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/reel/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    const reelId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/reel/' + reelId }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(reelId);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/reel/{reelId}', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'put',
                path: '/api/reel/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                const payload = {
                    description: 'description2'
                };
                internals.prepareServer((server) => {

                    const reelId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'POST', url: '/view/reel/' + reelId, payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/reel/{reelId}/delete', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'delete',
                path: '/api/reel/12345678-1234-1234-1234-123456789012',
                file: 'empty.txt'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'GET', url: '/view/reel/12345678-1234-1234-1234-123456789012/delete' }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });
});
