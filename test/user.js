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


describe('user', () => {

    it('GET /view/user', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/user',
                file: 'empty.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'GET', url: '/view/user' }, (response) => {

                        expect(response.statusCode).to.equal(200);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/user lloyd', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'post',
                path: '/api/user',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                const payload = {
                    name: 'lloyd',
                    type: 'local',
                    displayName: 'Lloyd Benson',
                    email: 'lloyd.benson@gmail.com',
                    password: 'password'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'POST', url: '/view/user', payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/user admin', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'post',
                path: '/api/user',
                file: 'admin.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                const payload = {
                    name: 'admin',
                    type: 'local',
                    displayName: 'Admin',
                    email: 'admin@localhost',
                    password: 'password'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'POST', url: '/view/user', payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/user/{userId} lloyd', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/user/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    const userId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'GET', url: '/view/user/' + userId }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(userId);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/user/{userId} admin', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/user/12345678-1234-1234-1234-123456789013',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    const userId = '12345678-1234-1234-1234-123456789013';
                    server.inject({ method: 'GET', url: '/view/user/' + userId }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        expect(response.result).to.contain(userId);
                        done();
                    });
                });
            });
        });
    });


    it('GET /view/users', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/users',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'GET', url: '/view/users' }, (response) => {

                        //console.log(response.result);
                        expect(response.statusCode).to.equal(200);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/user/{userId} lloyd', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'put',
                path: '/api/user/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                const payload = {
                    displayName: 'Lloyd Benson1',
                    type: 'local',
                    password: '$2a$10$6VgpayiqXWo8DB0FA6XZ5uH26WsryzRib3YJJvHzVCQC9eHRl4xea'
                };
                internals.prepareServer((server) => {

                    const userId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'POST', url: '/view/user/' + userId, payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/user/{userId} newpass', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'put',
                path: '/api/user/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                const payload = {
                    displayName: 'Lloyd Benson',
                    type: 'local',
                    password: 'password1'
                };
                internals.prepareServer((server) => {

                    const userId = '12345678-1234-1234-1234-123456789012';
                    server.inject({ method: 'POST', url: '/view/user/' + userId, payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });

    it('GET /view/user/{userId}/delete', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'delete',
                path: '/api/user/12345678-1234-1234-1234-123456789012',
                file: 'empty.txt'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'GET', url: '/view/user/12345678-1234-1234-1234-123456789012/delete' }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        done();
                    });
                });
            });
        });
    });
});
