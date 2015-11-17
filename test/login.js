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

describe('login', () => {

    it('GET /view/login', (done) => {

        internals.prepareServer((server) => {

            server.inject({ method: 'GET', url: '/view/login' }, (response) => {

                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('GET /view/logout nologin', (done) => {

        internals.prepareServer((server) => {

            server.inject({ method: 'GET', url: '/view/logout' }, (response) => {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('POST /view/login no user', (done) => {

        const payload = {
            type: 'local'
        };
        internals.prepareServer((server) => {

            server.inject({ method: 'POST', url: '/view/login', payload: payload }, (response) => {

                expect(response.statusCode).to.equal(302);
                expect(response.request.auth.artifacts).to.not.exist();
                done();
            });
        });
    });

    it('POST /view/login invalid user', (done) => {

        const payload = {
            name: 'invalid',
            type: 'local'
        };
        internals.prepareServer((server) => {

            server.inject({ method: 'POST', url: '/view/login', payload: payload }, (response) => {

                expect(response.statusCode).to.equal(302);
                expect(response.request.auth.artifacts).to.not.exist();
                done();
            });
        });
    });

    it('POST /view/login lloyd', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/user/byname/lloyd',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/user/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'post',
                path: '/api/user/12345678-1234-1234-1234-123456789012/validate',
                file: 'true'
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
                    password: 'password'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'POST', url: '/view/login', payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        const artifacts = response.request.auth.artifacts;
                        expect(artifacts.userId.length).to.equal(36);
                        expect(artifacts.name).to.equal('lloyd');
                        expect(artifacts.displayName).to.equal('Lloyd Benson');
                        expect(artifacts.type).to.equal('local');
                        server.inject({ method: 'GET', url: '/view/logout' }, (response2) => {

                            expect(response2.statusCode).to.equal(302);
                            expect(response2.request.auth.artifacts).to.not.exist();
                            done();
                        });
                    });
                });
            });
        });
    });

    it('POST /view/login admin', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/user/byname/admin',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/user/12345678-1234-1234-1234-123456789013',
                file: 'index.json'
            },
            {
                method: 'post',
                path: '/api/user/12345678-1234-1234-1234-123456789013/validate',
                file: 'true'
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
                    password: 'password'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'POST', url: '/view/login', payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        const artifacts = response.request.auth.artifacts;
                        expect(artifacts.userId.length).to.equal(36);
                        expect(artifacts.name).to.equal('admin');
                        expect(artifacts.displayName).to.equal('Admin');
                        expect(artifacts.type).to.equal('local');
                        server.inject({ method: 'GET', url: '/view/logout' }, (response2) => {

                            expect(response2.statusCode).to.equal(302);
                            expect(response2.request.auth.artifacts).to.not.exist();
                            done();
                        });
                    });
                });
            });
        });
    });

    it('POST /view/login admin new', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/user/byname/admin',
                file: 'null'
            },
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
                    password: 'password'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'POST', url: '/view/login', payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        const artifacts = response.request.auth.artifacts;
                        expect(artifacts.name).to.equal('admin');
                        expect(artifacts.type).to.equal('local');
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/login lloyd badpass', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/user/byname/lloyd',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/user/12345678-1234-1234-1234-123456789012',
                file: 'index.json'
            },
            {
                method: 'post',
                path: '/api/user/12345678-1234-1234-1234-123456789012/validate',
                file: 'false'
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
                    password: 'password1'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'POST', url: '/view/login', payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        expect(response.request.auth.artifacts).to.not.exist();
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/login admin badpass', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/user/byname/admin',
                file: 'index.json'
            },
            {
                method: 'get',
                path: '/api/user/12345678-1234-1234-1234-123456789013',
                file: 'index.json'
            },
            {
                method: 'post',
                path: '/api/user/12345678-1234-1234-1234-123456789013/validate',
                file: 'false'
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
                    password: 'password'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'POST', url: '/view/login', payload: payload }, (response) => {

                        expect(response.statusCode).to.equal(302);
                        expect(response.request.auth.artifacts).to.not.exist();
                        done();
                    });
                });
            });
        });
    });

    it('POST /view/login invalid', (done) => {

        const type = 'tacklebox';
        const routes = [
            {
                method: 'get',
                path: '/api/user/byname/invalid',
                file: 'index.json'
            }
        ];
        Mock.prepareServer(type, routes, (mockServer) => {

            mockServer.start(() => {

                internals.defaults.api = {
                    url: mockServer.info.uri + '/api'
                };
                const payload = {
                    name: 'invalid',
                    type: 'local',
                    password: 'password'
                };
                internals.prepareServer((server) => {

                    server.inject({ method: 'POST', url: '/view/login', payload: payload }, (response) => {


                        expect(response.statusCode).to.equal(302);
                        expect(response.request.auth.artifacts).to.not.exist();
                        done();
                    });
                });
            });
        });
    });
});
