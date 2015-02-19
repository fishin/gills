var Handlebars = require('handlebars');
var AuthCookie = require('hapi-auth-cookie');
var Hapi = require('hapi');
var Hoek = require('hoek');
var Joi = require('joi');
var Ui = require('./ui');

var internals = {
    defaults: {
        viewPath: '/view',
        job: {
            dirPath: '/tmp/gills/job',
            workspace: 'workspace'
        },
        reel: {
            dirPath: '/tmp/gills/reel'
        },
        user: {
            dirPath: '/tmp/gills/user'
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
    },  function (err) {
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
    },  function (err) {

        var bellAuthOptions = {
            provider: 'github',
            password: settings.session.bell.github.password,
            clientId: settings.session.bell.github.clientId,
            clientSecret: settings.session.bell.github.clientSecret,
            isSecure: false
        };
        server.auth.strategy('github', 'bell', bellAuthOptions);
    });

    var tackleboxOptions = {
        job: settings.job,
        run: settings.run,
        reel: settings.reel,
        user: settings.user
    };

    server.register({

        register: require('tacklebox'),
        options: tackleboxOptions
    },  function (err) {
//        if (err) {
//            console.error('Failed to load plugin:', err);
//        }
    });

    settings.plugins = server.plugins;

    // start scheduler
    server.plugins.tacklebox.startScheduler(server.plugins.tacklebox.getJobs());

    var ui = new Ui(settings);

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
                description: "redirect / to /gills/jobs"
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/jobs',
            config: {
                handler: ui.Job.getJobsView,
                description: "get jobs"
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job',
            config: {
                handler: ui.Job.getJobCreateView,
                description: "get job create view"
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/job',
            config: {
                handler: ui.Job.createJob,
                description: "create job",
                validate: {
                    payload: {
                        name: Joi.string().required(),
                        description: Joi.string().allow('').optional(),
                        headCommand0: Joi.string().allow('').optional(),
                        headCommand1: Joi.string().allow('').optional(),
                        scm_type: Joi.string().allow('').optional(),
                        scm_prs: Joi.boolean().allow('').optional(),
                        scm_runOnCommit: Joi.boolean().allow('').optional(),
                        scm_url: Joi.string().allow('').optional(),
                        scm_branch: Joi.string().allow('').optional(),
                        bodyCommand0: Joi.string().allow('').optional(),
                        bodyCommand1: Joi.string().allow('').optional(),
                        tailCommand0: Joi.string().allow('').optional(),
                        tailCommand1: Joi.string().allow('').optional(),
                        notify_to: Joi.string().allow('').optional(),
                        notify_type: Joi.string().allow('').optional(),
                        notify_subject: Joi.string().allow('').optional(),
                        notify_message: Joi.string().allow('').optional(),
                        archivePattern: Joi.string().allow('').optional(),
                        archiveMaxDays: Joi.number().allow('').optional(),
                        archiveMaxNum: Joi.number().allow('').optional(),
                        archive_type: Joi.string().allow('').optional(),
                        schedule_type: Joi.string().allow('').optional(),
                        cronPattern: Joi.string().allow('').optional()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}',
            config: {
                handler: ui.Job.getJobView,
                description: "get job view",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/start',
            config: {
                handler: ui.Job.startJob,
                description: "start job",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/queue/{jobId}/add',
            config: {
                handler: ui.Queue.addJob,
                description: "add job to queue",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/queue/{jobId}/remove',
            config: {
                handler: ui.Queue.removeJob,
                description: "remove job from queue",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/job/{jobId}',
            config: {
                handler: ui.Job.updateJob,
                description: "update job",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required()
                    },
                    payload: {
                        name: Joi.string().optional(),
                        description: Joi.string().allow('').optional(),
                        headCommand0: Joi.string().allow('').optional(),
                        headCommand1: Joi.string().allow('').optional(),
                        scm_type: Joi.string().allow('').optional(),
                        scm_prs: Joi.boolean().allow('').optional(),
                        scm_runOnCommit: Joi.boolean().allow('').optional(),
                        scm_url: Joi.string().allow('').optional(),
                        scm_branch: Joi.string().allow('').optional(),
                        bodyCommand0: Joi.string().allow('').optional(),
                        bodyCommand1: Joi.string().allow('').optional(),
                        tailCommand0: Joi.string().allow('').optional(),
                        tailCommand1: Joi.string().allow('').optional(),
                        notify_to: Joi.string().allow('').optional(),
                        notify_type: Joi.string().allow('').optional(),
                        notify_subject: Joi.string().allow('').optional(),
                        notify_message: Joi.string().allow('').optional(),
                        archivePattern: Joi.string().allow('').optional(),
                        archiveMaxDays: Joi.number().allow('').optional(),
                        archiveMaxNum: Joi.number().allow('').optional(),
                        archive_type: Joi.string().allow('').optional(),
                        schedule_type: Joi.string().allow('').optional(),
                        cronPattern: Joi.string().allow('').optional()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/delete',
            config: {
                handler: ui.Job.deleteJob,
                description: "delete job",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/workspace/delete',
            config: {
                handler: ui.Job.deleteWorkspace,
                description: "delete workspace",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/commits',
            config: {
                handler: ui.Job.getCommitsView,
                description: "get commits",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/run/{runId}',
            config: {
                handler: ui.Run.getRunView,
                description: "get run view",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required(),
                        runId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/run/{runId}/archive/{file}',
            config: {
                handler: ui.Run.getFileView,
                description: "get file view",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required(),
                        runId: Joi.string().guid().required(),
                        file: Joi.string().required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/run/{runId}/test',
            config: {
                handler: ui.Run.getTestView,
                description: "get test view",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required(),
                        runId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/run/{runId}/coverage',
            config: {
                handler: ui.Run.getCoverageView,
                description: "get coverage view",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required(),
                        runId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/run/{runId}/delete',
            config: {
                handler: ui.Run.deleteRun,
                description: "delete run",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required(),
                        runId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/job/{jobId}/run/{runId}/cancel',
            config: {
                handler: ui.Run.cancelRun,
                description: "cancel run",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required(),
                        runId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/reel',
            config: {
                handler: ui.Reel.getReelCreateView,
                description: "create reel view"
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/reel',
            config: {
                handler: ui.Reel.createReel,
                description: "create reel",
                validate: {
                    payload: {
                        name: Joi.string().required(),
                        host: Joi.string().hostname().required(),
                        size: Joi.number().required(),
                        description: Joi.string().allow(''),
                        directory: Joi.string().allow(''),
                        port: Joi.number().allow('')
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/reel/{reelId}',
            config: {
                handler: ui.Reel.getReelView,
                description: "get reel view",
                validate: {
                    params: {
                        reelId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/reel/{reelId}',
            config: {
                handler: ui.Reel.updateReel,
                description: "update reel",
                validate: {
                    params: {
                        reelId: Joi.string().guid().required()
                    },
                    payload: {
                        name: Joi.string(),
                        host: Joi.string().hostname(),
                        size: Joi.number(),
                        description: Joi.string().allow(''),
                        directory: Joi.string().allow(''),
                        port: Joi.number().allow('')
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/reel/{reelId}/delete',
            config: {
                handler: ui.Reel.deleteReel,
                description: "delete reel",
                validate: {
                    params: {
                        reelId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/user',
            config: {
                handler: ui.User.createUser,
                description: "create user",
                validate: {
                    payload: {
                        name: Joi.string().required(),
                        type: Joi.string().required(),
                        displayName: Joi.string().when('type', { is: 'local', then: Joi.required(), otherwise: Joi.allow('').optional() }),
                        email: Joi.string().email().when('type', { is: 'local', then: Joi.required(), otherwise: Joi.allow('').optional() }),
                        password: Joi.string().when('type', { is: 'local', then: Joi.required(), otherwise: Joi.allow('').optional() })
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/user',
            config: {
                handler: ui.User.getUserCreateView,
                description: "create user view"
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/user/{userId}',
            config: {
                handler: ui.User.getUserView,
                description: "get user view",
                validate: {
                    params: {
                        userId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/user/{userId}',
            config: {
                handler: ui.User.updateUser,
                description: "update user",
                validate: {
                    params: {
                        userId: Joi.string().guid().required()
                    },
                    payload: {
                        name: Joi.string(),
                        type: Joi.string(),
                        displayName: Joi.string().when('type', { is: 'local', then: Joi.string().optional(), otherwise: Joi.string().allow('').optional() }),
                        email: Joi.string().email().when('type', { is: 'local', then: Joi.string().optional(), otherwise: Joi.string().allow('').optional() }),
                        password: Joi.string().when('type', { is: 'local', then: Joi.string().optional(), otherwise: Joi.string().allow('').optional() })
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/users',
            config: {
                handler: ui.User.getUsersView,
                description: "get users"
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/user/{userId}/delete',
            config: {
                handler: ui.User.deleteUser,
                description: "delete user",
                validate: {
                    params: {
                        userId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'POST',
            path: settings.viewPath + '/login',
            config: {
                handler: ui.User.loginUser,
                description: "login user",
                auth: false,
                validate: {
                    payload: {
                        type: Joi.string().required(),
                        name: Joi.string().allow('').optional(),
                        password: Joi.string().allow('').optional()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/logout',
            config: {
                handler: ui.User.logoutUser,
                description: "logout user"
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/login',
            config: {
                handler: ui.User.getLoginView,
                description: "login view",
                auth: false
            }
        },
        {
            method: 'GET',
            path: settings.viewPath + '/login/github',
            config: {
                handler: ui.User.loginGithub,
                description: "github login",
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
