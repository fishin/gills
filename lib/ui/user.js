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
   this.loginUser = exports.loginUser;
   this.logoutUser = exports.logoutUser;
   this.getLoginView = exports.getLoginView;
};

exports.getUserView = function (request, reply) {

    var config = internals.User.getUserConfig(request.params.userId);
    config.credentials = request.auth.credentials;
    reply.view('layout', config);
};

exports.getUsersView = function (request, reply) {

    var config = internals.User.getUsersConfig();
    config.credentials = request.auth.credentials;
    reply.view('layout', config);
};

exports.getUserCreateView = function (request, reply) {

    var config = internals.User.getUserCreateConfig();
    config.credentials = request.auth.credentials;
    reply.view('layout', config);
};

exports.createUser = function (request, reply) {

    var createConfig = internals.User.createUser(request.payload);
    reply.redirect(internals.User.settings.viewPath + '/user/'+ createConfig.id);
};

exports.deleteUser = function (request, reply) {

    internals.User.deleteUser(request.params.userId);
    reply.redirect(internals.User.settings.viewPath + '/users');
};

exports.updateUser = function (request, reply) {

    var updateConfig = internals.User.updateUser(request.params.userId, request.payload);
    reply.redirect(internals.User.settings.viewPath + '/user/'+ updateConfig.id);
};

exports.loginUser = function (request, reply) {

    if (request.payload.name) { 
        if (request.payload.name === 'admin') {
            if (internals.User.settings.plugins.tacklebox.validatePassword(request.payload.password, internals.User.settings.admin.password)) {
                request.auth.session.set({
                    name: request.payload.name,
                    type: 'admin'
                });
                return reply.redirect('/');
            } else {
                console.log('invalid admin password');
                return reply.redirect('/');
            }
        }
        var user = internals.User.settings.plugins.tacklebox.getUserByName(request.payload.name);
        if (user) {
            //if (user.password === request.payload.password) {
            if (internals.User.settings.plugins.tacklebox.validatePassword(request.payload.password, user.password)) {
                request.auth.session.set({
                    userId: user.id,
                    name: request.payload.name,
                    displayName: user.displayName,
                    type: request.payload.type
                });
                return reply.redirect('/');
            } else {
                console.log(user.name + ' did not have a valid password');
                return reply.redirect('/');
            }
        } else {
            console.log('not a valid username');
            return reply.redirect('/');
        }
    } else {
        // you did not supply a name
        console.log('no username provided');
        return reply.redirect('/');
    }
};

exports.logoutUser = function (request, reply) {

    request.auth.session.clear();
    return reply.redirect('/');
};

exports.getLoginView = function (request, reply) {

    reply.view('layout', {});
};
