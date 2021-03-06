'use strict';

const DateFormat = require('dateformat');
const Hoek = require('hoek');
const Wreck = require('wreck');

const internals = {};

module.exports = internals.Run = function (options) {

    internals.Run.settings = options;
    this.getRunConfig = exports.getRunConfig;
    this.getPullRequestRunConfig = exports.getPullRequestRunConfig;
    this.getFileConfig = exports.getFileConfig;
    this.getTestConfig = exports.getTestConfig;
    this.getCoverageConfig = exports.getCoverageConfig;
    this.deleteRun = exports.deleteRun;
    this.deleteRuns = exports.deleteRuns;
    this.cancelRun = exports.cancelRun;
    this.cancelPullRequest = exports.cancelPullRequest;
};

exports.getRunConfig = function (jobId, runId, cb) {

    const config = {
        viewRun: true,
        jobId: jobId
    };
    internals.Run.settings.Utils.Common.getCommonConfig((commonConfig) => {

        //console.log(commonConfig);
        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId, { json: true }, (err, resp, pl) => {

            Hoek.assert(!err, err);
            if (pl !== null && !pl.statusCode) {
                config.name = pl.name;
            }
            Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId, { json: true }, (err2, resp2, pl2) => {

                Hoek.assert(!err2, err2);
                let run = {};
                config.runId = runId;
                if (!pl2.statusCode) {
                    run = pl2;
                    config.status = run.status;
                    config.commit = run.commit;
                    config.checkout = run.checkout;
                    config.shortRunId = run.id.split('-')[0];
                }
                Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/runs', { json: true }, (err3, resp3, pl3) => {

                    Hoek.assert(!err3, err3);
                    let runs = [];
                    if (!pl3.statusCode) {
                        runs = pl3;
                    }
                    // set default as itself with override later
                    const comparePayload = {
                        commit1: config.commit,
                        commit2: config.commit
                    };
                    for (let i = 0; i < runs.length; ++i) {
                        // figure out which runIndex it is
                        if (runs[i].id === runId) {
                            // get the prev run if its not the first one
                            if (i !== runs.length - 1) {
                                comparePayload.commit2 = runs[i + 1].commit;
                            }
                        }
                    }
                    Wreck.post(internals.Run.settings.api.url + '/job/' + jobId + '/commits/compare', { payload: JSON.stringify(comparePayload), json: true }, (err4, resp4, pl4) => {

                        Hoek.assert(!err4, err4);
                        // if no commit gives an error
                        if (!pl4.statusCode) {
                            config.compareCommits = pl4;
                        }
                        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId + '/test', { json: true }, (err5, resp5, pl5) => {

                            Hoek.assert(!err5, err5);
                            if (pl5 !== null && !pl5.statusCode) {
                                config.testResult = pl5;
                                config.testResult.totalDuration = internals.Run.settings.displayTimeString(config.testResult.totalDuration);
                                if (config.testResult.lint) {
                                    config.lintErrors = 0;
                                    for (let i = 0; i < config.testResult.lint.length; ++i) {
                                        config.lintErrors += config.testResult.lint[i].errors.length;
                                    }
                                }

                            }
                            Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId + '/archive', { json: true }, (err6, resp6, pl6) => {

                                Hoek.assert(!err6, err6);
                                let files = [];
                                if (!pl6.statusCode) {
                                    files = pl6;
                                }
                                config.archiveFiles = [];
                                for (let i = 0; i < files.length; ++i) {
                                    const fileConfig = {
                                        jobId: jobId,
                                        runId: runId,
                                        file: files[i]
                                    };
                                    config.archiveFiles.push(fileConfig);
                                }
                                config.commands = [];
                                if (run.checkout && run.checkout.commands) {
                                    for (let i = 0; i < run.checkout.commands.length; ++i) {
                                        //console.log(run.checkout.commands[i]);
                                        const startCheckoutTime = run.checkout.commands[i].startTime;
                                        if (run.checkout.commands[i].startTime) {
                                            run.checkout.commands[i].startTime = DateFormat(startCheckoutTime, 'yyyy-mm-dd HH:MM:ss');
                                        }
                                        if (run.checkout.commands[i].finishTime) {
                                            run.checkout.commands[i].elapsedTime = run.checkout.commands[i].finishTime - startCheckoutTime;
                                            run.checkout.commands[i].finishTime = DateFormat(run.checkout.commands[i].finishTime, 'yyyy-mm-dd HH:MM:ss');
                                        }
                                        config.commands.push(run.checkout.commands[i]);
                                    }
                                }
                                for (let i = 0; i < run.commands.length; ++i) {
                                    //console.log(run.commands[i]);
                                    const startTime = run.commands[i].startTime;
                                    if (run.commands[i].startTime) {
                                        run.commands[i].startTime = DateFormat(startTime, 'yyyy-mm-dd HH:MM:ss');
                                    }
                                    if (run.commands[i].finishTime) {
                                        run.commands[i].elapsedTime = run.commands[i].finishTime - startTime;
                                        run.commands[i].finishTime = DateFormat(run.commands[i].finishTime, 'yyyy-mm-dd HH:MM:ss');
                                    }
                                    config.commands.push(run.commands[i]);
                                }
                                config.startTime = DateFormat(run.startTime, 'yyyy-mm-dd HH:MM:ss');
                                if (run.finishTime) {
                                    config.finishTime = DateFormat(run.finishTime, 'yyyy-mm-dd HH:MM:ss');
                                    config.elapsedTime = run.finishTime - run.startTime;
                                }
                                Hoek.merge(config, commonConfig);
                                return cb(config);
                            });
                        });
                    });
                });
            });
        });
    });
};

exports.getPullRequestRunConfig = function (jobId, number, runId, cb) {

    const config = {
        viewRun: true,
        jobId: jobId,
        number: number,
        runId: runId
    };
    internals.Run.settings.Utils.Common.getCommonConfig((commonConfig) => {

        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId, { json: true }, (err, resp, pl) => {

            Hoek.assert(!err, err);
            const job = pl;
            config.name = job.name;
            Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/pr/' + number + '/run/' + runId, { json: true }, (err3, resp3, pl3) => {

                Hoek.assert(!err3, err3);
                const run = pl3;
                config.status = run.status;
                config.commit = run.commit;
                config.checkout = run.checkout;
                config.commands = [];
                if (run.checkout && run.checkout.commands) {
                    for (let i = 0; i < run.checkout.commands.length; ++i) {
                        //console.log(run.checkout.commands[i]);
                        const startCheckoutTime = run.checkout.commands[i].startTime;
                        if (run.checkout.commands[i].startTime) {
                            run.checkout.commands[i].startTime = DateFormat(startCheckoutTime, 'yyyy-mm-dd HH:MM:ss');
                        }
                        if (run.checkout.commands[i].finishTime) {
                            run.checkout.commands[i].elapsedTime = run.checkout.commands[i].finishTime - startCheckoutTime;
                            run.checkout.commands[i].finishTime = DateFormat(run.checkout.commands[i].finishTime, 'yyyy-mm-dd HH:MM:ss');
                        }
                        config.commands.push(run.checkout.commands[i]);
                    }
                }
                for (let i = 0; i < run.commands.length; ++i) {
                    //console.log(run.commands[i]);
                    const startTime = run.commands[i].startTime;
                    if (run.commands[i].startTime) {
                        run.commands[i].startTime = DateFormat(startTime, 'yyyy-mm-dd HH:MM:ss');
                    }
                    if (run.commands[i].finishTime) {
                        run.commands[i].elapsedTime = run.commands[i].finishTime - startTime;
                        run.commands[i].finishTime = DateFormat(run.commands[i].finishTime, 'yyyy-mm-dd HH:MM:ss');
                    }
                    config.commands.push(run.commands[i]);
                }
                config.shortRunId = runId.split('-')[0];
                config.startTime = DateFormat(run.startTime, 'yyyy-mm-dd HH:MM:ss');
                if (run.finishTime) {
                    config.finishTime = DateFormat(run.finishTime, 'yyyy-mm-dd HH:MM:ss');
                    config.elapsedTime = run.elapsedTime;
                }
                Hoek.merge(config, commonConfig);
                return cb(config);
            });
        });
    });
};

exports.getTestConfig = function (jobId, runId, cb) {

    internals.Run.settings.Utils.Common.getCommonConfig((commonConfig) => {

        //console.log(commonConfig);
        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId, { json: 'true' }, (err, resp, pl) => {

            Hoek.assert(!err, err);
            let run = null;
            if (pl !== null && !pl.statusCode) {
                run = pl;
            }
            Wreck.get(internals.Run.settings.api.url + '/job/' + jobId, { json: 'true' }, (err2, resp2, pl2) => {

                Hoek.assert(!err2, err2);
                let job = null;
                if (pl2 !== null && !pl2.statusCode) {
                    job = pl2;
                }
                Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId + '/test', { json: 'true' }, (err3, resp3, pl3) => {

                    Hoek.assert(!err3, err3);
                    const config = {
                        viewTest: true,
                        jobId: job.id,
                        runId: run.id,
                        name: job.name,
                        elapsedTime: run.elapsedTime,
                        status: run.status
                    };
                    if (pl3 !== null && !pl3.statusCode) {
                        config.testResult = pl3;
                        //console.log(config.testResult);
                    }
                    Hoek.merge(config, commonConfig);
                    return cb(config);
                });
            });
        });
    });
};

exports.getCoverageConfig = function (jobId, runId, cb) {

    internals.Run.settings.Utils.Common.getCommonConfig((commonConfig) => {

        //console.log(commonConfig);
        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId, { json: true }, (err, resp, pl) => {

            Hoek.assert(!err, err);
            const run = pl;
            Wreck.get(internals.Run.settings.api.url + '/job/' + jobId, { json: true }, (err2, resp2, pl2) => {

                Hoek.assert(!err2, err2);
                const job = pl2;
                Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId + '/test', { json: true }, (err3, resp3, pl3) => {

                    Hoek.assert(!err3, err3);
                    const testResult = pl3;
                    const config = {
                        jobId: job.id,
                        runId: run.id,
                        name: job.name,
                        testResult: testResult
                    };
                    config.viewCoverage = true;
                    Hoek.merge(config, commonConfig);
                    return cb(config);
                });
            });
        });
    });
};

exports.getFileConfig = function (jobId, runId, file, cb) {

    internals.Run.settings.Utils.Common.getCommonConfig((commonConfig) => {

        Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId + '/archive/' + file, (err, resp, pl) => {

            Hoek.assert(!err, err);
            const contents = pl;
            const config = {
                jobId: jobId,
                runId: runId,
                file: file,
                contents: contents
            };
            config.viewFile = true;
            Hoek.merge(config, commonConfig);
            return cb(config);
        });
    });
};

exports.deleteRun = function (jobId, runId, cb) {

    Wreck.delete(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId, (err, resp, pl) => {

        Hoek.assert(!err, err);
        return cb();
    });
};

exports.deleteRuns = function (jobId, cb) {

    Wreck.delete(internals.Run.settings.api.url + '/job/' + jobId + '/runs', (err, resp, pl) => {

        Hoek.assert(!err, err);
        return cb();
    });
};

exports.cancelRun = function (jobId, runId, cb) {

    Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/run/' + runId + '/cancel', (err, resp, pl) => {

        Hoek.assert(!err, err);
        return cb();
    });
};

exports.cancelPullRequest = function (jobId, number, runId, cb) {

    Wreck.get(internals.Run.settings.api.url + '/job/' + jobId + '/pr/' + number + '/run/' + runId + '/cancel', (err, resp, pl) => {

        Hoek.assert(!err, err);
        return cb();
    });
};
