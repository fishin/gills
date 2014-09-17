var Handlebars = require('handlebars');
var Hapi = require('hapi');
var Hoek = require('hoek');
var Joi = require('joi');
var Gills = require('./gills');

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

    var gills = new Gills(settings);

    plugin.views({
        path: __dirname + '/../views',
        partialsPath: __dirname + '/../views/partials',
        engines: {
            html: require('handlebars')
        }
    });

    plugin.route([

        { method: 'GET', path: '/', config: { handler: gills.redirectHome, description: "redirect / to /gills/jobs" } },
        { method: 'GET', path: settings.apiPath + '/jobs', config: { handler: gills.getJobs, description: "get jobs" } },
        { method: 'GET', path: settings.apiPath + '/job/create', config: { handler: gills.getJob, description: "get job" } },
        { method: 'POST', path: settings.apiPath + '/job', config: { handler: gills.createJob, description: "create job" } },
        { method: 'GET', path: settings.apiPath + '/job/{id}', config: { handler: gills.getJob, description: "get job" } },
        { method: 'GET', path: settings.apiPath + '/job/{id}/run', config: { handler: gills.runJob, description: "run job" } },
        { method: 'POST', path: settings.apiPath + '/job/{id}', config: { handler: gills.updateJob, description: "update job" } },
        { method: 'GET', path: settings.apiPath + '/job/{id}/delete', config: { handler: gills.deleteJob, description: "delete job" } },
        { method: 'GET', path: settings.apiPath + '/css/{path*}', config: css },
        { method: 'GET', path: settings.apiPath + '/js/{path*}', config: js }

    ]);

    next();
};

exports.register.attributes = {

    pkg: require('../package.json')
};
