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
        },
        user: {
            dirPath: '/tmp/testgills/user'
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

describe('queue', function () {

    it('POST /view/job 1', function (done) {

        internals.prepareServer(function (server) {

            var payload1 = {
                name: 'name1',
                description: 'description',
                bodyCommand0: 'date'
            };
            server.inject({ method: 'POST', url: '/view/job', payload: payload1}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('POST /view/job 2', function (done) {

        internals.prepareServer(function (server) {

            var payload2 = {
                name: 'name2',
                description: 'description',
                bodyCommand0: 'date'
            };
            server.inject({ method: 'POST', url: '/view/job', payload: payload2}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/queue/{jobId}/add 1', function (done) {

        internals.prepareServer(function (server) {

            var jobId1 = server.plugins.tacklebox.getJobs()[0].id;
            expect(jobId1).to.exist();
            server.inject({ method: 'GET', url: '/view/queue/'+jobId1+'/add'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/queue/{jobId}/add 2', function (done) {

        internals.prepareServer(function (server) {

            var jobId2 = server.plugins.tacklebox.getJobs()[1].id;
            expect(jobId2).to.exist();
            server.inject({ method: 'GET', url: '/view/queue/'+jobId2+'/add'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/jobs', function (done) {

        internals.prepareServer(function (server) {

            server.inject({ method: 'GET', url: '/view/jobs'}, function (response) {

                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    it('GET /view/queue/{jobId}/remove 2', function (done) {

        internals.prepareServer(function (server) {

            var jobId2 = server.plugins.tacklebox.getJobs()[1].id;
            server.inject({ method: 'GET', url: '/view/queue/'+jobId2+'/remove'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/queue/{jobId}/remove 1', function (done) {

        internals.prepareServer(function (server) {

            var jobId1 = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/queue/'+jobId1+'/remove'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/queue/{jobId}/delete 1', function (done) {

        internals.prepareServer(function (server) {

            var jobId1 = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/'+jobId1+'/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });

    it('GET /view/queue/{jobId}/delete 2', function (done) {

        internals.prepareServer(function (server) {

            var jobId2 = server.plugins.tacklebox.getJobs()[0].id;
            server.inject({ method: 'GET', url: '/view/job/'+jobId2+'/delete'}, function (response) {

                expect(response.statusCode).to.equal(302);
                done();
            });
        });
    });
});
