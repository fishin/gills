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

exports.register = function (plugin, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options);

    plugin.route([
        { method: 'GET', path: settings.ui.basePath, config: { handler: Ui.getHome, description: "get homepage" } }
    ]);

    next();
};

exports.register.attributes = {

    pkg: require('../package.json')
};
