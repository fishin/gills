var Lab = require('lab');
var Hapi = require('hapi');

var lab = exports.lab = Lab.script();
var expect = Lab.expect;
var before = lab.before;
var after = lab.after;
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

    server.pack.register({
        plugin: require('..'),
        options: internals.defaults
    }, function (err) {

        expect(err).to.not.exist;
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
                    var job_id1 = server.plugins.tacklebox.getJobs()[0].id;
                    var job_id2 = server.plugins.tacklebox.getJobs()[1].id;
                    expect(job_id1).to.exist;
                    expect(job_id2).to.exist;
                    server.inject({ method: 'GET', url: '/gills/queue/'+job_id1+'/add'}, function (response) {

                        expect(response.statusCode).to.equal(302);
                        server.inject({ method: 'GET', url: '/gills/queue/'+job_id2+'/add'}, function (response) {

                            server.inject({ method: 'GET', url: '/gills/jobs'}, function (response) {

                                expect(response.statusCode).to.equal(200);
                                server.inject({ method: 'GET', url: '/gills/queue/'+job_id2+'/remove'}, function (response) {

                                    expect(response.statusCode).to.equal(302);
                                    server.inject({ method: 'GET', url: '/gills/queue/'+job_id1+'/remove'}, function (response) {

                                        expect(response.statusCode).to.equal(302);
                                        server.inject({ method: 'GET', url: '/gills/job/'+job_id1+'/delete'}, function (response) {

                                            expect(response.statusCode).to.equal(302);
                                            server.inject({ method: 'GET', url: '/gills/job/'+job_id2+'/delete'}, function (response) {

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
