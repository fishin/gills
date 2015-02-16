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

//    console.log(request.payload);
//    console.log(request.auth);
    //var user = internals.User.settings.plugins.tacklebox.getUserByName(request.payload.name);
    request.auth.session.set({
        name: request.payload.name,
        displayName: request.payload.name,
        type: request.payload.type,
        password: request.payload.password
    });
//    request.auth.isAuthenticated = true;
//    console.log(request.auth);
    reply.redirect('/');
/*   
    if (request.auth.isAuthenticated) {
       console.log('logged in');
       reply.redirect('/');
    } else {
       console.log('not logged in');
       reply.redirect('/');
    }
*/
};

exports.logoutUser = function (request, reply) {

    if (request.auth.session) {
        request.auth.session.clear();
    }
    return reply.redirect('/');
};

exports.getLoginView = function (request, reply) {

    return reply('<html><head><title>Login page</title></head><body>'
            + '<form method="post" action="'+ internals.User.settings.viewPath +'/login">'
            + 'Username: <input type="text" name="name"><br>'
            + 'Password: <input type="password" name="password"><br/>'
            + '<input type="hidden" name="type" value="local"><br>'
            + '<input type="submit" value="Login"></form></body></html>');
};
