var Handlebars = require('handlebars');
var Hapi = require('hapi');
var Hoek = require('hoek');
var Joi = require('joi');
var Ui = require('./ui');

var internals = {
    defaults: {
        apiPath: '/gills',
        job: {
            dirpath: '/tmp/gills/job'
        },
        reel: {
            dirpath: '/tmp/gills/reel'
        },
        user: {
            dirpath: '/tmp/gills/user'
        }
    }
};

var css = { handler: { directory: { listing: true, index: false, path: __dirname + '/../css' } } };
var js = { handler: { directory: { listing: true, index: false, path: __dirname + '/../js' } } };
var fonts = { handler: { directory: { listing: true, index: false, path: __dirname + '/../fonts' } } };

exports.register = function (server, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options);

    // need to figure out how to disable routes for plugins
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

    var ui = new Ui(settings);

    server.views({
        path: __dirname + '/../views',
        partialsPath: __dirname + '/../views/partials',
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
            path: settings.apiPath + '/jobs',
            config: {
                handler: ui.Job.getJobs,
                description: "get jobs"
            }
        },
        {
            method: 'GET',
            path: settings.apiPath + '/job',
            config: {
                handler: ui.Job.getJobCreateView,
                description: "get job create view"
            }
        },
        {
            method: 'POST',
            path: settings.apiPath + '/job',
            config: {
                handler: ui.Job.createJob,
                description: "create job",
                validate: {
                    payload: {
                        name: Joi.string().required(),
                        description: Joi.string().allow('').optional(),
                        headCommand1: Joi.string().allow('').optional(),
                        scm_type: Joi.string().allow('').optional(),
                        scm_url: Joi.string().allow('').optional(),
                        scm_branch: Joi.string().allow('').optional(),
                        bodyCommand1: Joi.string().allow('').optional(),
                        bodyCommand2: Joi.string().allow('').optional(),
                        tailCommand1: Joi.string().allow('').optional(),
                        notify_to: Joi.string().allow('').optional(),
                        notify_type: Joi.string().allow('').optional(),
                        notify_subject: Joi.string().allow('').optional(),
                        notify_message: Joi.string().allow('').optional(),
                        archivePattern: Joi.string().allow('').optional(),
                        archive_type: Joi.string().allow('').optional()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.apiPath + '/job/{jobId}',
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
            path: settings.apiPath + '/job/{jobId}/start',
            config: {
                handler: ui.Run.startRun,
                description: "start run",
                validate: {
                    params: {
                        jobId: Joi.string().guid().required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.apiPath + '/queue/{jobId}/add',
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
            path: settings.apiPath + '/queue/{jobId}/remove',
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
            path: settings.apiPath + '/job/{jobId}',
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
                        headCommand1: Joi.string().allow('').optional(),
                        scm_type: Joi.string().allow('').optional(),
                        scm_url: Joi.string().allow('').optional(),
                        scm_branch: Joi.string().allow('').optional(),
                        bodyCommand1: Joi.string().allow('').optional(),
                        bodyCommand2: Joi.string().allow('').optional(),
                        tailCommand1: Joi.string().allow('').optional(),
                        notify_to: Joi.string().allow('').optional(),
                        notify_type: Joi.string().allow('').optional(),
                        notify_subject: Joi.string().allow('').optional(),
                        notify_message: Joi.string().allow('').optional(),
                        archivePattern: Joi.string().allow('').optional(),
                        archive_type: Joi.string().allow('').optional()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.apiPath + '/job/{jobId}/delete',
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
            path: settings.apiPath + '/job/{jobId}/workspace/delete',
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
            path: settings.apiPath + '/job/{jobId}/run/{runId}',
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
            path: settings.apiPath + '/job/{jobId}/run/{runId}/delete',
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
            path: settings.apiPath + '/job/{jobId}/run/{runId}/cancel',
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
            path: settings.apiPath + '/reel',
            config: {
                handler: ui.Reel.getReelCreateView,
                description: "create reel view"
            }
        },
        {
            method: 'POST',
            path: settings.apiPath + '/reel',
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
            path: settings.apiPath + '/reel/{reelId}',
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
            path: settings.apiPath + '/reel/{reelId}',
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
            path: settings.apiPath + '/reel/{reelId}/delete',
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
            path: settings.apiPath + '/user',
            config: {
                handler: ui.User.createUser,
                description: "create user",
                validate: {
                    payload: {
                        username: Joi.string().required(),
                        name: Joi.string(),
                        email: Joi.string().email()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.apiPath + '/user',
            config: {
                handler: ui.User.getUserCreateView,
                description: "create user view"
            }
        },
        {
            method: 'GET',
            path: settings.apiPath + '/user/{userId}',
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
            path: settings.apiPath + '/user/{userId}',
            config: {
                handler: ui.User.updateUser,
                description: "update user",
                validate: {
                    params: {
                        userId: Joi.string().guid().required()
                    },
                    payload: {
                        username: Joi.string(),
                        name: Joi.string(),
                        email: Joi.string().email()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: settings.apiPath + '/users',
            config: {
                handler: ui.User.getUsersView,
                description: "get users"
            }
        },
        {
            method: 'GET',
            path: settings.apiPath + '/user/{userId}/delete',
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
            method: 'GET',
            path: settings.apiPath + '/css/{path*}',
            config: css
        },
        {
            method: 'GET',
            path: settings.apiPath + '/js/{path*}',
            config: js
        },
        {
            method: 'GET',
            path: settings.apiPath + '/fonts/{path*}',
            config: fonts
        }
    ]);

    next();
};

exports.register.attributes = {

    pkg: require('../package.json')
};
