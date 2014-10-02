var Handlebars = require('handlebars');
var Hapi = require('hapi');
var Hoek = require('hoek');
var Joi = require('joi');
var Ui = require('./ui');

var internals = {
    defaults: {
        apiPath: '/gills',
        job: {
            dirpath: '/tmp/gills/job',
            workspace: 'workspace',
            configFile: 'config.json'
        },
        run: {
//            dirpath: '/tmp/gills/run',
            workspace: 'workspace',
            configFile: 'config.json'
        },
        reel: {
            dirpath: '/tmp/gills/reel',
            workspace: 'workspace',
            configFile: 'config.json'
        },
        user: {
            dirpath: '/tmp/gills/user',
            workspace: 'workspace',
            configFile: 'config.json'
        }
    }
};

var css = { handler: { directory: { listing: true, index: false, path: __dirname + '/../css' } } };
var js = { handler: { directory: { listing: true, index: false, path: __dirname + '/../js' } } };
var fonts = { handler: { directory: { listing: true, index: false, path: __dirname + '/../fonts' } } };

exports.register = function (plugin, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options);

    // need to figure out how to disable routes for plugins
    var tackleboxOptions = {
        job: settings.job,
        run: settings.run,
        reel: settings.reel,
        user: settings.user
    };

    plugin.register({

        plugin:require('tacklebox'),
        options: tackleboxOptions
    },  function (err) {
//        if (err) {
//            console.error('Failed to load plugin:', err);
//        }
    });

    settings.plugins = plugin.plugins;

    var ui = new Ui(settings);

    plugin.views({
        path: __dirname + '/../views',
        partialsPath: __dirname + '/../views/partials',
        engines: {
            html: require('handlebars')
        }
    });

    plugin.route([

        { method: 'GET', path: '/', config: { handler: ui.redirectHome, description: "redirect / to /gills/jobs" } },
        { method: 'GET', path: settings.apiPath + '/jobs', config: { handler: ui.Job.getJobs, description: "get jobs" } },
        { method: 'GET', path: settings.apiPath + '/job', config: { handler: ui.Job.getJobCreateView, description: "get job create view" } },
        { method: 'POST', path: settings.apiPath + '/job', config: { handler: ui.Job.createJob, description: "create job" } },
        { method: 'GET', path: settings.apiPath + '/job/{job_id}', config: { handler: ui.Job.getJobView, description: "get job view" } },
        { method: 'GET', path: settings.apiPath + '/job/{job_id}/start', config: { handler: ui.Run.startRun, description: "start run" } },
        { method: 'POST', path: settings.apiPath + '/job/{job_id}', config: { handler: ui.Job.updateJob, description: "update job" } },
        { method: 'GET', path: settings.apiPath + '/job/{job_id}/delete', config: { handler: ui.Job.deleteJob, description: "delete job" } },
        { method: 'GET', path: settings.apiPath + '/job/{job_id}/run/{run_id}', config: { handler: ui.Run.getRunView, description: "get run view" } },
        { method: 'GET', path: settings.apiPath + '/job/{job_id}/run/{run_id}/delete', config: { handler: ui.Run.deleteRun, description: "delete run" } },
        { method: 'GET', path: settings.apiPath + '/job/{job_id}/run/{run_id}/cancel', config: { handler: ui.Run.cancelRun, description: "cancel run" } },
        { method: 'GET', path: settings.apiPath + '/reel', config: { handler: ui.Reel.getReelCreateView, description: "create reel view" } },
        { method: 'GET', path: settings.apiPath + '/reel/{reel_id}', config: { handler: ui.Reel.getReelView, description: "get reel view" } },
        { method: 'POST', path: settings.apiPath + '/reel/{reel_id}', config: { handler: ui.Reel.updateReel, description: "update reel" } },
        { method: 'POST', path: settings.apiPath + '/reel', config: { handler: ui.Reel.createReel, description: "create reel" } },
        { method: 'GET', path: settings.apiPath + '/reel/{reel_id}/delete', config: { handler: ui.Reel.deleteReel, description: "delete reel" } },
        { method: 'GET', path: settings.apiPath + '/user', config: { handler: ui.User.getUserCreateView, description: "create user view" } },
        { method: 'GET', path: settings.apiPath + '/user/{user_id}', config: { handler: ui.User.getUserView, description: "get user view" } },
        { method: 'POST', path: settings.apiPath + '/user/{user_id}', config: { handler: ui.User.updateUser, description: "update user" } },
        { method: 'POST', path: settings.apiPath + '/user', config: { handler: ui.User.createUser, description: "create user" } },
        { method: 'GET', path: settings.apiPath + '/users', config: { handler: ui.User.getUsersView, description: "get users" } },
        { method: 'GET', path: settings.apiPath + '/user/{user_id}/delete', config: { handler: ui.User.deleteUser, description: "delete user" } },
        { method: 'GET', path: settings.apiPath + '/css/{path*}', config: css },
        { method: 'GET', path: settings.apiPath + '/js/{path*}', config: js },
        { method: 'GET', path: settings.apiPath + '/fonts/{path*}', config: fonts }

    ]);

    next();
};

exports.register.attributes = {

    pkg: require('../package.json')
};
