var Utils = require('../utils');

var internals = {};

module.exports = internals.User = function(options) {

   this.settings = options;
   internals.User.settings = options;
   var utils = new Utils(options);
   internals.User.createUser = utils.User.createUser;
   internals.User.updateUser = utils.User.updateUser;
   internals.User.deleteUser = utils.User.deleteUser;
   internals.User.getUserConfig = utils.User.getUserConfig;
   internals.User.getUsersConfig = utils.User.getUsersConfig;
   internals.User.getUserCreateConfig = utils.User.getUserCreateConfig;
   this.createUser = exports.createUser;
   this.updateUser = exports.updateUser;
   this.deleteUser = exports.deleteUser;
   this.getUserView = exports.getUserView;
   this.getUsersView = exports.getUsersView;
   this.getUserCreateView = exports.getUserCreateView;
};

exports.getUserView = function (request, reply) {

    var config = internals.User.getUserConfig(request.params.user_id);
    reply.view('layout', config);
};

exports.getUsersView = function (request, reply) {

    var config = internals.User.getUsersConfig();
    reply.view('layout', config);
};

exports.getUserCreateView = function (request, reply) {

    var config = internals.User.getUserCreateConfig();
    reply.view('layout', config);
};

exports.createUser = function (request, reply) {

    var createConfig = internals.User.createUser(request.payload);
    reply.redirect('/gills/user/'+ createConfig.id);
};

exports.deleteUser = function (request, reply) {

    internals.User.deleteUser(request.params.user_id);
    reply.redirect('/gills/jobs');
};

exports.updateUser = function (request, reply) {

    var updateConfig = internals.User.updateUser(request.params.user_id, request.payload);
    reply.redirect('/gills/user/'+ updateConfig.id);
};
