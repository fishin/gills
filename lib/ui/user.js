'use strict';

const Wreck = require('wreck');
//const Utils = require('../utils');

const internals = {};

module.exports = internals.User = function (options) {

    this.settings = options;
    internals.User.settings = options;
//    const utils = new Utils(options);
    internals.User.createUser = options.Utils.User.createUser;
    internals.User.updateUser = options.Utils.User.updateUser;
    internals.User.deleteUser = options.Utils.User.deleteUser;
    internals.User.getUserConfig = options.Utils.User.getUserConfig;
    internals.User.getUsersConfig = options.Utils.User.getUsersConfig;
    internals.User.getUserCreateConfig = options.Utils.User.getUserCreateConfig;
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

    internals.User.getUserConfig(request.params.userId, (config) => {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getUsersView = function (request, reply) {

    internals.User.getUsersConfig((config) => {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.getUserCreateView = function (request, reply) {

    internals.User.getUserCreateConfig((config) => {

        config.credentials = request.auth.credentials;
        return reply.view('layout', config);
    });
};

exports.createUser = function (request, reply) {

    internals.User.createUser(request.payload, (createConfig) => {

        return reply.redirect(internals.User.settings.viewPath + '/user/' + createConfig.id);
    });
};

exports.deleteUser = function (request, reply) {

    internals.User.deleteUser(request.params.userId, () => {

        return reply.redirect(internals.User.settings.viewPath + '/users');
    });
};

exports.updateUser = function (request, reply) {

    internals.User.updateUser(request.params.userId, request.payload, (updateConfig) => {

        return reply.redirect(internals.User.settings.viewPath + '/user/' + updateConfig.id);
    });
};

exports.loginUser = function (request, reply) {

    if (request.payload.type === 'github') {
        return reply.redirect(internals.User.settings.viewPath + '/login/github');
    }
    if (request.payload.name) {
        if (request.payload.name === 'admin') {
            Wreck.get(internals.User.settings.api.url + '/user/byname/' + request.payload.name, { json: true }, (err, resp, pl) => {

                let adminUser = null;
                if (pl) {
                    adminUser = pl;
                }
                if (!adminUser) {
                    const adminConfig = {
                        name: 'admin',
                        type: 'local',
                        displayName: 'admin',
                        email: 'admin@localhost',
                        password: request.payload.password
                    };
                    Wreck.post(internals.User.settings.api.url + '/user', { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify(adminConfig), json: true }, (err2, resp2, pl2) => {

                        const createdUser = pl2;
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
                }
                else {
                    const userConfig = {
                        password: request.payload.password
                    };
                    Wreck.post(internals.User.settings.api.url + '/user/' + adminUser.id + '/validate', { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify(userConfig), json: true }, (err3, resp3, pl3) => {

                        if (pl3 === true) {
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
        }
        else {
            // normal user
            Wreck.get(internals.User.settings.api.url + '/user/byname/' + request.payload.name, { json: true }, (err4, resp4, pl4) => {

                let user = null;
                if (pl4) {
                    user = pl4;
                    const config = {
                        password: request.payload.password
                    };
                    Wreck.post(internals.User.settings.api.url + '/user/' + user.id + '/validate', { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify(config), json: true }, (err5, resp5, pl5) => {

                        if (pl5 === true) {
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
                }
                else {
                    console.log('not a valid username');
                    return reply.redirect('/');
                }
            });
        }
    }
    else {
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
        Wreck.get(internals.User.settings.api.url + '/user/byname/' + request.auth.credentials.profile.username, { json: true }, (err, resp, pl) => {

            let user = null;
            if (pl) {
                user = pl;
            }
            if (user === 'admin') {
                // might be possible in internal github
                console.log('admin is a reserved account name');
            }
            else if (!user) {
                console.log(request.auth.credentials.profile.username + ' is not authorized');
            }
            else {
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
    }
    else {
        return reply.redirect('/');
    }
};
