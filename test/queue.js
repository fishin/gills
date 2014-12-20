var Code = require('code');
var Lab = require('lab');
var Hapi = require('hapi');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

var internals = {
    defaults: {
        apiPath: '/gills',
        job: {
            dirpath: '/tmp/testgills/job',
            workspace: 'workspace',
            configFile: 'config.json'
        },
        run: {
//            dirpath: '/tmp/testgills/run',
            workspace: 'workspace',
            configFile: 'config.json'
        },
        reel: {
            dirpath: '/tmp/testgills/reel',
            workspace: 'workspace',
            configFile: 'config.json'
        },
        user: {
            dirpath: '/tmp/testgills/user',
            workspace: 'workspace',
            configFile: 'config.json'
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

    it('queue flow', function (done) {
        internals.prepareServer(function (server) {

            var payload1 = {
                name: 'name1',
                description: 'description',
                body: 'date'
            };
            var payload2 = {
                name: 'name2',
                description: 'description',
                body: 'date'
            };
            server.inject({ method: 'POST', url: '/gills/job', payload: payload1}, function (response) {

                expect(response.statusCode).to.equal(302);
                server.inject({ method: 'POST', url: '/gills/job', payload: payload2}, function (response) {
                    var jobId1 = server.plugins.tacklebox.getJobs()[0].id;
                    var jobId2 = server.plugins.tacklebox.getJobs()[1].id;
                    expect(jobId1).to.exist();
                    expect(jobId2).to.exist();
                    server.inject({ method: 'GET', url: '/gills/queue/'+jobId1+'/add'}, function (response) {

                        expect(response.statusCode).to.equal(302);
                        server.inject({ method: 'GET', url: '/gills/queue/'+jobId2+'/add'}, function (response) {

                            server.inject({ method: 'GET', url: '/gills/jobs'}, function (response) {

                                expect(response.statusCode).to.equal(200);
                                server.inject({ method: 'GET', url: '/gills/queue/'+jobId2+'/remove'}, function (response) {

                                    expect(response.statusCode).to.equal(302);
                                    server.inject({ method: 'GET', url: '/gills/queue/'+jobId1+'/remove'}, function (response) {

                                        expect(response.statusCode).to.equal(302);
                                        server.inject({ method: 'GET', url: '/gills/job/'+jobId1+'/delete'}, function (response) {

                                            expect(response.statusCode).to.equal(302);
                                            server.inject({ method: 'GET', url: '/gills/job/'+jobId2+'/delete'}, function (response) {

                                                expect(response.statusCode).to.equal(302);
                                                done();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

});
