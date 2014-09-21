var Handlebars = require('handlebars');
var Hapi = require('hapi');
var Hoek = require('hoek');
var Joi = require('joi');
var Ui = require('./ui');

var internals = {
    defaults: {
        apiPath: '/gills',
        job: {
            pailPath: '/tmp/gills/job',
            workspace: 'workspace',
            configFile: 'config.json'
        },
        run: {
            pailPath: '/tmp/gills/run',
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
        run: settings.run
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
        { method: 'GET', path: settings.apiPath + '/job/create', config: { handler: ui.Job.getJob, description: "get job" } },
        { method: 'POST', path: settings.apiPath + '/job', config: { handler: ui.Job.createJob, description: "create job" } },
        { method: 'GET', path: settings.apiPath + '/job/{id}', config: { handler: ui.Job.getJob, description: "get job" } },
        { method: 'GET', path: settings.apiPath + '/job/{id}/run', config: { handler: ui.Run.runJob, description: "run job" } },
        { method: 'POST', path: settings.apiPath + '/job/{id}', config: { handler: ui.Job.updateJob, description: "update job" } },
        { method: 'GET', path: settings.apiPath + '/job/{id}/delete', config: { handler: ui.Job.deleteJob, description: "delete job" } },
        { method: 'GET', path: settings.apiPath + '/job/{id}/run/{run_id}', config: { handler: ui.Run.getRun, description: "get run" } },
        { method: 'GET', path: settings.apiPath + '/job/{id}/run/{run_id}/delete', config: { handler: ui.Run.deleteRun, description: "delete run" } },
        { method: 'GET', path: settings.apiPath + '/reel/create', config: { handler: ui.Reel.getReel, description: "create reel" } },
        { method: 'GET', path: settings.apiPath + '/reel/{id}', config: { handler: ui.Reel.getReel, description: "get reel" } },
        { method: 'POST', path: settings.apiPath + '/reel/{id}', config: { handler: ui.Reel.updateReel, description: "update reel" } },
        { method: 'POST', path: settings.apiPath + '/reel', config: { handler: ui.Reel.createReel, description: "create reel" } },
        { method: 'GET', path: settings.apiPath + '/reel/{id}/delete', config: { handler: ui.Reel.deleteReel, description: "delete reel" } },
        { method: 'GET', path: settings.apiPath + '/css/{path*}', config: css },
        { method: 'GET', path: settings.apiPath + '/js/{path*}', config: js },
        { method: 'GET', path: settings.apiPath + '/fonts/{path*}', config: fonts }

    ]);

    next();
};

exports.register.attributes = {

    pkg: require('../package.json')
};
