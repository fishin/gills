var Joi = require('joi');

exports.requiredJobSchema = {
    jobId: Joi.string().guid().required()
};

exports.requiredRunSchema = {
    jobId: Joi.string().guid().required(),
    runId: Joi.string().guid().required()
};

exports.createJobSchema = {
    name: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    targets: Joi.string().optional(),
    headCommand0: Joi.string().allow('').optional(),
    headCommand1: Joi.string().allow('').optional(),
    scmType: Joi.string().allow('').optional(),
    scmPrs: Joi.boolean().allow('').optional(),
    scmRunOnCommit: Joi.boolean().allow('').optional(),
    scmUrl: Joi.string().allow('').optional(),
    scmBranch: Joi.string().allow('').optional(),
    cleanCommand: Joi.string().allow('').optional(),
    installCommand: Joi.string().allow('').optional(),
    testCommand: Joi.string().allow('').optional(),
    tailCommand0: Joi.string().allow('').optional(),
    tailCommand1: Joi.string().allow('').optional(),
    notifyTo: Joi.string().allow('').optional(),
    notifyType: Joi.string().allow('').optional(),
    notifySubject: Joi.string().allow('').optional(),
    notifyMessage: Joi.string().allow('').optional(),
    notifyStatusFailed: Joi.boolean().optional(),
    notifyStatusFixed: Joi.boolean().optional(),
    notifyStatusCancelled: Joi.boolean().optional(),
    notifyStatusSucceeded: Joi.boolean().optional(),
    archivePattern: Joi.string().allow('').optional(),
    archiveType: Joi.string().allow('').optional(),
    archiveMaxNumber: Joi.number().when('archiveType', { is: ['maxnum', 'maxdays'], then: Joi.required(), otherwise: Joi.allow('').optional() }),
    scheduleType: Joi.string().allow('').optional(),
    cronPattern: Joi.string().allow('').optional()
};


exports.updateJobSchema = {
    name: Joi.string().optional(),
    description: Joi.string().allow('').optional(),
    targets: Joi.string().optional(),
    headCommand0: Joi.string().allow('').optional(),
    headCommand1: Joi.string().allow('').optional(),
    scmType: Joi.string().allow('').optional(),
    scmPrs: Joi.boolean().allow('').optional(),
    scmRunOnCommit: Joi.boolean().allow('').optional(),
    scmUrl: Joi.string().allow('').optional(),
    scmBranch: Joi.string().allow('').optional(),
    cleanCommand: Joi.string().allow('').optional(),
    installCommand: Joi.string().allow('').optional(),
    testCommand: Joi.string().allow('').optional(),
    tailCommand0: Joi.string().allow('').optional(),
    tailCommand1: Joi.string().allow('').optional(),
    notifyTo: Joi.string().allow('').optional(),
    notifyType: Joi.string().allow('').optional(),
    notifySubject: Joi.string().allow('').optional(),
    notifyMessage: Joi.string().allow('').optional(),
    notifyStatusFailed: Joi.boolean().optional(),
    notifyStatusFixed: Joi.boolean().optional(),
    notifyStatusCancelled: Joi.boolean().optional(),
    notifyStatusSucceeded: Joi.boolean().optional(),
    archivePattern: Joi.string().allow('').optional(),
    archiveType: Joi.string().allow('').optional(),
    archiveMaxNumber: Joi.number().when('archiveType', { is: ['maxnum', 'maxdays'], then: Joi.required(), otherwise: Joi.allow('').optional() }),
    scheduleType: Joi.string().allow('').optional(),
    cronPattern: Joi.string().allow('').optional()
};

exports.getFileSchema = {
    jobId: Joi.string().guid().required(),
    runId: Joi.string().guid().required(),
    file: Joi.string().required()
};

exports.prJobSchema = {
    jobId: Joi.string().guid().required(),
    pr: Joi.number().required()
};

exports.prRunSchema = {
    jobId: Joi.string().guid().required(),
    pr: Joi.number().required(),
    runId: Joi.string().guid().required()
};

exports.createReelSchema = {
    name: Joi.string().required(),
    host: Joi.string().hostname().required(),
    size: Joi.number().required(),
    description: Joi.string().allow(''),
    directory: Joi.string().allow(''),
    port: Joi.number().allow('')
};

exports.requiredReelSchema = {
    reelId: Joi.string().guid().required()
};

exports.updateReelSchema = {
    name: Joi.string(),
    host: Joi.string().hostname(),
    size: Joi.number(),
    description: Joi.string().allow(''),
    directory: Joi.string().allow(''),
    port: Joi.number().allow('')
};

exports.createUserSchema = {
    name: Joi.string().required(),
    type: Joi.string().required(),
    displayName: Joi.string().when('type', { is: 'local', then: Joi.required(), otherwise: Joi.allow('').optional() }),
    email: Joi.string().email().when('type', { is: 'local', then: Joi.required(), otherwise: Joi.allow('').optional() }),
    password: Joi.string().when('type', { is: 'local', then: Joi.required(), otherwise: Joi.allow('').optional() })
};

exports.requiredUserSchema = {
    userId: Joi.string().guid().required()
};

exports.updateUserSchema = {
    name: Joi.string(),
    type: Joi.string(),
    displayName: Joi.string().when('type', { is: 'local', then: Joi.string().optional(), otherwise: Joi.string().allow('').optional() }),
    email: Joi.string().email().when('type', { is: 'local', then: Joi.string().optional(), otherwise: Joi.string().allow('').optional() }),
    password: Joi.string().when('type', { is: 'local', then: Joi.string().optional(), otherwise: Joi.string().allow('').optional() })
};

exports.loginUserSchema = {
    type: Joi.string().required(),
    name: Joi.string().allow('').optional(),
    password: Joi.string().allow('').optional()
};
