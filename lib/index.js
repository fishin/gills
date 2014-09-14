var Handlebars = require('handlebars');
var Hapi = require('hapi');
var Hoek = require('hoek');
var Joi = require('joi');
var Gills = require('./gills');

var internals = {
    defaults: {
        ui: {
            basePath: '/gills'
        }
    }
};

var css = { handler: { directory: { listing: true, index: false, path: __dirname + '/../css' } } };
var js = { handler: { directory: { listing: true, index: false, path: __dirname + '/../js' } } };

exports.register = function (plugin, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options);
    plugin.views({
        path: __dirname + '/../views',
        partialsPath: __dirname + '/../views/partials',
        engines: {
            html: require('handlebars')
        }
    });

    plugin.route([

        { method: 'GET', path: '/', config: { handler: Gills.redirectHome, description: "redirect / to /gills/jobs" } },
        { method: 'GET', path: settings.ui.basePath + '/jobs', config: { handler: Gills.getJobs, description: "get jobs" } },
        { method: 'GET', path: settings.ui.basePath + '/job/create', config: { handler: Gills.createJob, description: "create job" } },
        { method: 'GET', path: settings.ui.basePath + '/css/{path*}', config: css },
        { method: 'GET', path: settings.ui.basePath + '/js/{path*}', config: js }

    ]);

    next();
};

exports.register.attributes = {

    pkg: require('../package.json')
};
