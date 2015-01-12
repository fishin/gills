var Cron = require('node-crontab');

var internals = {
    jobs: []
};

module.exports = internals.Scheduler = function(options) {

    this.settings = options;
    internals.Scheduler.settings = options;
    internals.Scheduler.addSchedule = exports.addSchedule;
    this.initialize = internals.initialize;
    this.addSchedule = exports.addSchedule;
    this.removeSchedule = exports.removeSchedule;
};

internals.initialize = function() {

    //console.log('initializing scheduler');
    var jobs = internals.Scheduler.settings.plugins.tacklebox.getJobs();
    for (var i = 0; i < jobs.length; i++) {
        if (jobs[i].schedule && jobs[i].schedule.type == 'cron' ) {
            var jobId = jobs[i].id;
            internals.Scheduler.addSchedule(jobId);
        }
    }
};

internals.getScheduleId = function(jobId) {

    for (var i = 0; i < internals.jobs.length; i++) {
        if (internals.jobs[i].jobId === jobId) {
            return internals.jobs[i].scheduleId;
        }
    }
    return null;
};

exports.removeSchedule = function(jobId) {
 
    var intId = internals.getScheduleId(jobId);
    console.log('cancelling schedule for jobId: ' + jobId);
    console.log(intId);
    Cron.cancelJob(intId);
};
 
exports.addSchedule = function(jobId) {

    console.log('adding schedule job: ' + jobId);
    var scheduleJob = internals.Scheduler.settings.plugins.tacklebox.getJob(jobId);
    console.log('scheduling new job for jobid: ' + jobId);
    var scheduleId = Cron.scheduleJob(scheduleJob.schedule.pattern, function() {

        console.log('trigger'); 
        internals.Scheduler.settings.plugins.tacklebox.startRun(jobId);
    }, null, jobId);
    internals.jobs.push({ jobId: jobId, scheduleId: scheduleId }); 
};
