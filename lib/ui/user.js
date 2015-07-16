var Wreck = require('wreck');
var Utils = require('../utils');

var internals = {};

module.exports = internals.User = function (options) {

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
    this.loginGithub = exports.loginGithub;
};

exports.getUserView = function (request, reply) {

    internals.User.getUserConfig(request.params.userId, function (config) {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getUsersView = function (request, reply) {

    internals.User.getUsersConfig(function (config) {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getUserCreateView = function (request, reply) {

    internals.User.getUserCreateConfig(function (config) {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.createUser = function (request, reply) {

    internals.User.createUser(request.payload, function (createConfig) {

        return reply.redirect(internals.User.settings.viewPath + '/user/' + createConfig.id);
    });
};

exports.deleteUser = function (request, reply) {

    internals.User.deleteUser(request.params.userId, function () {

        return reply.redirect(internals.User.settings.viewPath + '/users');
    });
};

exports.updateUser = function (request, reply) {

    internals.User.updateUser(request.params.userId, request.payload, function (updateConfig) {

        return reply.redirect(internals.User.settings.viewPath + '/user/' + updateConfig.id);
    });
};

exports.loginUser = function (request, reply) {

    if (request.payload.type === 'github') {
        return reply.redirect(internals.User.settings.viewPath + '/login/github');
    }
    if (request.payload.name) {
        if (request.payload.name === 'admin') {
            Wreck.get(internals.User.settings.api.url + '/user/byname/' + request.payload.name, function (err, resp, pl) {

                var adminUser = null;
                if (pl) {
                    adminUser = JSON.parse(pl);
                }
                if (!adminUser) {
                    var adminConfig = {
                        name: 'admin',
                        type: 'local',
                        displayName: 'admin',
                        email: 'admin@localhost',
                        password: request.payload.password
                    };
                    Wreck.post(internals.User.settings.api.url + '/user', { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify(adminConfig) }, function (err2, resp2, pl2) {

                        var createdUser = JSON.parse(pl2);
                        request.auth.session.set({

                            userId: createdUser.id,
                            name: createdUser.name,
                            displayName: createdUser.displayName,
                            url: internals.User.settings.viewPath + '/user/' + createdUser.id,
                            type: request.payload.type
                        });
                        console.log('created admin user');
                        return reply.redirect('/');
                    });
                } else {
                    var userConfig = {
                        password: request.payload.password
                    };
                    Wreck.post(internals.User.settings.api.url + '/user/' + adminUser.id + '/validate', { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify(userConfig) }, function (err3, resp3, pl3) {

                        if (pl3 === 'true') {
                            request.auth.session.set({

                                userId: adminUser.id,
                                name: adminUser.name,
                                displayName: adminUser.displayName,
                                url: internals.User.settings.viewPath + '/user/' + adminUser.id,
                                type: request.payload.type
                            });
                            return reply.redirect('/');
                        }
                        console.log('invalid admin password');
                        return reply.redirect('/');
                    });
                }
            });
        } else {
            // normal user
            Wreck.get(internals.User.settings.api.url + '/user/byname/' + request.payload.name, function (err4, resp4, pl4) {

                var user = null;
                if (pl4) {
                    user = JSON.parse(pl4);
                    var config = {
                        password: request.payload.password
                    };
                    Wreck.post(internals.User.settings.api.url + '/user/' + user.id + '/validate', { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify(config) }, function (err5, resp5, pl5) {

                        if (pl5 === 'true') {
                            request.auth.session.set({

                                userId: user.id,
                                name: request.payload.name,
                                displayName: user.displayName,
                                url: internals.User.settings.viewPath + '/user/' + user.id,
                                type: request.payload.type
                            });
                            return reply.redirect('/');
                        }
                        console.log(user.name + ' did not have a valid password');
                        return reply.redirect('/');
                    });
                } else {
                    console.log('not a valid username');
                    return reply.redirect('/');
                }
            });
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

    return reply.view('layout', {});
};

exports.loginGithub = function (request, reply) {

    if (request.auth.isAuthenticated) {
        Wreck.get(internals.User.settings.api.url + '/user/byname/' + request.auth.credentials.profile.username, function (err, resp, pl) {

            var user = null;
            if (pl) {
                user = JSON.parse(pl);
            }
            if (user === 'admin') {
                // might be possible in internal github
                console.log('admin is a reserved account name');
            } else if (!user) {
                console.log(request.auth.credentials.profile.username + ' is not authorized');
            } else {
                request.auth.session.set({

                    userId: request.auth.credentials.profile.id,
                    name: request.auth.credentials.profile.username,
                    token: request.auth.credentials.token,
                    displayName: request.auth.credentials.profile.displayName,
                    url: request.auth.credentials.profile.raw.html_url,
                    type: 'github'
                });
            }
            return reply.redirect('/');
        });
    } else {
        return reply.redirect('/');
    }
};
