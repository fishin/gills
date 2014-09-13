var Handlebars = require('handlebars');
var Hapi = require('hapi');
var Hoek = require('hoek');
var Joi = require('joi');
var Ui = require('./ui');

var internals = {
    defaults: {
        ui: {
            basePath: '/ui'
        }
    }
};

var css = { handler: { directory: { listing: false, index: false, path: './css' } } };
var js = { handler: { directory: { listing: false, index: false, path: './js' } } };

exports.register = function (plugin, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options);
    plugin.views({
        path: './tmpl',
        engines: {
            html: Handlebars.create()
        }
    });

    plugin.route([

        { method: 'GET', path: '/', config: { handler: Ui.redirectHome, description: "redirect / to /ui" } },
        { method: 'GET', path: settings.ui.basePath, config: { handler: Ui.getHome, description: "get homepage" } },
        { method: 'GET', path: settings.ui.basePath + '/css/{path*}', config: css },
        { method: 'GET', path: settings.ui.basePath + '/js/{path*}', config: js }

    ]);

    next();
};

exports.register.attributes = {

    pkg: require('../package.json')
};
