'use strict';

const Hoek = require('hoek');
const Inert = require('inert');
const Vision = require('vision');

const Schema = require('./schema');
const Ui = require('./ui');
const Utils = require('./utils');

const internals = {
    defaults: {
        viewPath: '/view',
        job: {
            dirPath: '/tmp/tacklebox/job',
            workspace: 'workspace'
        },
        reel: {
            dirPath: '/tmp/tacklebox/reel'
        },
        user: {
            dirPath: '/tmp/tacklebox/user'
        },
        session: {
            cookie: {
                name: 'ficion',
                password: 'secret'
            },
            bell: {
                github: {
                    password: 'secret',
                    clientId: 'clientId',
                    clientSecret: 'clientSecret'
                }
            }
        },
        api: {
            url: 'http://localhost:8081/api'
        }
    }
};

const css = {
    handler: {
        directory: {
            listing: true,
            index: false,
            path: __dirname + '/../css'
        }
    },
    auth: false
};
const js = {
    handler: {
        directory: {
            listing: true,
            index: false,
            path: __dirname + '/../js'
        }
    },
    auth: false
};
const fonts = {
    handler: {
        directory: {
            listing: true,
            index: false,
            path: __dirname + '/../fonts'
        }
    },
    auth: false
};

exports.register = function (server, options, next) {

    const settings = Hoek.applyToDefaults(internals.defaults, options);

    server.register({

        register: require('hapi-auth-cookie')
    }, (err) => {

        const authCookieOptions = {
            password: settings.session.cookie.password,
            cookie: settings.session.cookie.name,
            redirectTo: settings.viewPath + '/login',
            isSecure: false
        };
        server.auth.strategy('session', 'cookie', authCookieOptions);
    });

    server.register({

        register: require('bell')
    }, (err) => {

        const bellAuthOptions = {
            provider: 'github',
            password: settings.session.bell.github.password,
            scope: ['user', 'repo'],
            clientId: settings.session.bell.github.clientId,
            clientSecret: settings.session.bell.github.clientSecret,
            isSecure: false
        };
        server.auth.strategy('github', 'bell', bellAuthOptions);
    });

    settings.info = server.info;
    const utils = new Utils(settings);
    settings.Utils = utils;
    const ui = new Ui(settings);

    server.register([Inert, Vision], Hoek.ignore);
    server.views({
        path: __dirname + '/../views',
        partialsPath: __dirname + '/../views/partials',
        helpersPath: __dirname + '/../views/helpers',
        engines: {
            html: require('handlebars')
        }
    });

    server.route([

        {
            method: 'GET', path: '/',
            config: {
                auth: 'session',
                handler: ui.redirectHome,
                description: 'redirect / to /gills/jobs'
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/jobs',
            config: {
                auth: 'session',
                handler: ui.Job.getJobsView,
                description: 'get jobs'
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job',
            config: {
                auth: 'session',
                handler: ui.Job.getJobCreateView,
                description: 'get job create view'
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/job',
            config: {
                auth: 'session',
                handler: ui.Job.createJob,
                description: 'create job',
                validate: {
                    payload: Schema.createJobSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}',
            config: {
                auth: 'session',
                handler: ui.Job.getJobView,
                description: 'get job view',
                validate: {
                    params: Schema.requiredJobSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/queue/{jobId}/add',
            config: {
                auth: 'session',
                handler: ui.Queue.addJob,
                description: 'add job to queue',
                validate: {
                    params: Schema.requiredJobSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/queue/{jobId}/remove',
            config: {
                auth: 'session',
                handler: ui.Queue.removeJob,
                description: 'remove job from queue',
                validate: {
                    params: Schema.requiredJobSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/queue/clear',
            config: {
                auth: 'session',
                handler: ui.Queue.clearQueue,
                description: 'clear jobs from queue'
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/queue/{jobId}/pr/{pr}/remove',
            config: {
                auth: 'session',
                handler: ui.Queue.removePullRequest,
                description: 'remove pr from queue',
                validate: {
                    params: Schema.prJobSchema
                }
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/job/{jobId}',
            config: {
                auth: 'session',
                handler: ui.Job.updateJob,
                description: 'update job',
                validate: {
                    params: Schema.requiredJobSchema,
                    payload: Schema.updateJobSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/delete',
            config: {
                auth: 'session',
                handler: ui.Job.deleteJob,
                description: 'delete job',
                validate: {
                    params: Schema.requiredJobSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/workspace/delete',
            config: {
                auth: 'session',
                handler: ui.Job.deleteWorkspace,
                description: 'delete workspace',
                validate: {
                    params: Schema.requiredJobSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/commits',
            config: {
                auth: 'session',
                handler: ui.Job.getCommitsView,
                description: 'get commits',
                validate: {
                    params: Schema.requiredJobSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/run/{runId}',
            config: {
                auth: 'session',
                handler: ui.Run.getRunView,
                description: 'get run view',
                validate: {
                    params: Schema.requiredRunSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/run/{runId}/archive/{file}',
            config: {
                auth: 'session',
                handler: ui.Run.getFileView,
                description: 'get file view',
                validate: {
                    params: Schema.getFileSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/run/{runId}/test',
            config: {
                auth: 'session',
                handler: ui.Run.getTestView,
                description: 'get test view',
                validate: {
                    params: Schema.requiredRunSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/run/{runId}/coverage',
            config: {
                auth: 'session',
                handler: ui.Run.getCoverageView,
                description: 'get coverage view',
                validate: {
                    params: Schema.requiredRunSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/run/{runId}/delete',
            config: {
                auth: 'session',
                handler: ui.Run.deleteRun,
                description: 'delete run',
                validate: {
                    params: Schema.requiredRunSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/runs/delete',
            config: {
                auth: 'session',
                handler: ui.Run.deleteRuns,
                description: 'delete runs',
                validate: {
                    params: Schema.requiredJobSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/run/{runId}/cancel',
            config: {
                auth: 'session',
                handler: ui.Run.cancelRun,
                description: 'cancel run',
                validate: {
                    params: Schema.requiredRunSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/pr/{pr}/merge',
            config: {
                auth: 'session',
                handler: ui.Job.mergePullRequest,
                description: 'merge pull request',
                validate: {
                    params: Schema.prJobSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/pr/{pr}/retry',
            config: {
                auth: 'session',
                handler: ui.Job.retryPullRequest,
                description: 'retry pull request',
                validate: {
                    params: Schema.prJobSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/pr/{pr}/start',
            config: {
                auth: 'session',
                handler: ui.Job.startPullRequest,
                description: 'start pull request',
                validate: {
                    params: Schema.prJobSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/pr/{pr}/run/{runId}',
            config: {
                auth: 'session',
                handler: ui.Run.getPullRequestRunView,
                description: 'get pull request run view',
                validate: {
                    params: Schema.prRunSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/pr/{pr}/run/{runId}/cancel',
            config: {
                auth: 'session',
                handler: ui.Run.cancelPullRequest,
                description: 'cancel pull request',
                validate: {
                    params: Schema.prRunSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/reel',
            config: {
                auth: 'session',
                handler: ui.Reel.getReelCreateView,
                description: 'create reel view'
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/reel',
            config: {
                auth: 'session',
                handler: ui.Reel.createReel,
                description: 'create reel',
                validate: {
                    payload: Schema.createReelSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/reel/{reelId}',
            config: {
                auth: 'session',
                handler: ui.Reel.getReelView,
                description: 'get reel view',
                validate: {
                    params: Schema.requiredReelSchema
                }
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/reel/{reelId}',
            config: {
                auth: 'session',
                handler: ui.Reel.updateReel,
                description: 'update reel',
                validate: {
                    params: Schema.requiredReelSchema,
                    payload: Schema.updateReelSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/reel/{reelId}/delete',
            config: {
                auth: 'session',
                handler: ui.Reel.deleteReel,
                description: 'delete reel',
                validate: {
                    params: Schema.requiredReelSchema
                }
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/user',
            config: {
                auth: 'session',
                handler: ui.User.createUser,
                description: 'create user',
                validate: {
                    payload: Schema.createUserSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/user',
            config: {
                auth: 'session',
                handler: ui.User.getUserCreateView,
                description: 'create user view'
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/user/{userId}',
            config: {
                auth: 'session',
                handler: ui.User.getUserView,
                description: 'get user view',
                validate: {
                    params: Schema.requiredUserSchema
                }
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/user/{userId}',
            config: {
                auth: 'session',
                handler: ui.User.updateUser,
                description: 'update user',
                validate: {
                    params: Schema.requiredUserSchema,
                    payload: Schema.updateUserSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/users',
            config: {
                auth: 'session',
                handler: ui.User.getUsersView,
                description: 'get users'
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/user/{userId}/delete',
            config: {
                auth: 'session',
                handler: ui.User.deleteUser,
                description: 'delete user',
                validate: {
                    params: Schema.requiredUserSchema
                }
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/login',
            config: {
                auth: false,
                handler: ui.User.loginUser,
                description: 'login user',
                validate: {
                    payload: Schema.loginUserSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/logout',
            config: {
                auth: 'session',
                handler: ui.User.logoutUser,
                description: 'logout user'
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/login',
            config: {
                auth: false,
                handler: ui.User.getLoginView,
                description: 'login view',
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/login/github',
            config: {
                auth: 'github',
                handler: ui.User.loginGithub,
                description: 'github login'
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/css/{path*}',
            config: css
        },
        {
            method: 'GET',
            path: settings.viewPath + '/js/{path*}',
            config: js
        },
        {
            method: 'GET',
            path: settings.viewPath + '/fonts/{path*}',
            config: fonts
        }
    ]);

    next();
};

exports.register.attributes = {

    pkg: require('../package.json')
};
