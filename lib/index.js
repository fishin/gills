var Hoek = require('hoek');
var Inert = require('inert');
var Vision = require('vision');

var Schema = require('./schema');
var Ui = require('./ui');
var Utils = require('./utils');

var internals = {
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

var css = {
    handler: {
        directory: {
            listing: true,
            index: false,
            path: __dirname + '/../css'
        }
    },
    auth: false
};
var js = {
    handler: {
        directory: {
            listing: true,
            index: false,
            path: __dirname + '/../js'
        }
    },
    auth: false
};
var fonts = {
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

    var settings = Hoek.applyToDefaults(internals.defaults, options);

    server.register({

        register: require('hapi-auth-cookie')
    }, function (err) {

        var authCookieOptions = {
            password: settings.session.cookie.password,
            cookie: settings.session.cookie.name,
            redirectTo: settings.viewPath + '/login',
            isSecure: false
        };
        server.auth.strategy('session', 'cookie', authCookieOptions);
    });

    server.register({

        register: require('bell')
    }, function (err) {

        var bellAuthOptions = {
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
    var utils = new Utils(settings);
    settings.Utils = utils;
    var ui = new Ui(settings);

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
                handler: ui.redirectHome,
                description: 'redirect / to /gills/jobs'
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/jobs',
            config: {
                handler: ui.Job.getJobsView,
                description: 'get jobs'
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job',
            config: {
                handler: ui.Job.getJobCreateView,
                description: 'get job create view'
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/job',
            config: {
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
                handler: ui.Queue.clearQueue,
                description: 'clear jobs from queue'
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/queue/{jobId}/pr/{pr}/remove',
            config: {
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
                handler: ui.Reel.getReelCreateView,
                description: 'create reel view'
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/reel',
            config: {
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
                handler: ui.User.getUserCreateView,
                description: 'create user view'
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/user/{userId}',
            config: {
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
                handler: ui.User.getUsersView,
                description: 'get users'
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/user/{userId}/delete',
            config: {
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
                handler: ui.User.loginUser,
                description: 'login user',
                auth: false,
                validate: {
                    payload: Schema.loginUserSchema
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/logout',
            config: {
                handler: ui.User.logoutUser,
                description: 'logout user'
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/login',
            config: {
                handler: ui.User.getLoginView,
                description: 'login view',
                auth: false
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/login/github',
            config: {
                handler: ui.User.loginGithub,
                description: 'github login',
                auth: 'github'
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
