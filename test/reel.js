var Code = require('code');
var Lab = require('lab');
var Hapi = require('hapi');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var internals = {
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

    var server = new Hapi.Server();
    server.connection();

    server.register({
        register: require('..'),
        options: internals.defaults
    }, function (err) {

        expect(err).to.not.exist();
        callback(server);
   });
};

describe('reel', function () {

    it('POST /view/reel', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                host: 'localhost',
                size: 2
            };
            server.inject({ method: 'POST', url: '/view/reel', payload: payload}, function (response) {

                //console.log(response);
                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/reel/{reelId}', function (done) {

        internals.prepareServer(function (server) {

            var reelId = server.plugins.tacklebox.getReels()[0].id;
            server.inject({ method: 'GET', url: '/view/reel/' + reelId}, function (response) {

                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('POST /view/reel/{reelId}', function (done) {

        internals.prepareServer(function (server) {

            var reelId = server.plugins.tacklebox.getReels()[0].id;
            var updatePayload = { description: 'description2' };
            server.inject({ method: 'POST', url: '/view/reel/' + reelId, payload: updatePayload}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/jobs', function (done) {

        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/view/jobs'}, function (response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.exist();
                done();
            });
        });
    });

    it('POST /view/jobs', function (done) {

        internals.prepareServer(function (server) {

            var payload = {
                name: 'name',
                description: 'description',
                bodyCommand0: 'date'
            };
            server.inject({ method: 'POST', url: '/view/job', payload: payload}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/job/{jobId}', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId}, function (response) {

                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('GET /view/job', function (done) {

        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/view/job'}, function (response) {

                //console.log(response);
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('GET /view/reel', function (done) {

        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/view/reel'}, function (response) {

                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('GET /view/job/{jobId}/delete', function (done) {

        internals.prepareServer(function (server) {

            var jobId = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/' + jobId + '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/reel/{reelId}/delete', function (done) {

        internals.prepareServer(function (server) {

            var reelId = server.plugins.tacklebox.getReels()[0].id;
            server.inject({ method: 'GET', url: '/view/reel/' + reelId + '/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });
});
