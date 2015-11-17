'use strict';

const Code = require('code');
const Lab = require('lab');
const Hapi = require('hapi');

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

const internals = {
    defaults: {
        viewPath: '/view',
        job: {
            dirPath: '/tmp/testgills/job'
        },
        reel: {
            dirPath: '/tmp/testgills/reel'
        }
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
        callback(server);
    });
};

describe('redirect', () => {

    it('GET /', (done) => {

        internals.prepareServer((server) => {

            server.inject({ method: 'GET', url: '/' }, (response) => {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });
});
