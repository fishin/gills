var Cron = require('cron');

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

internals.getSchedule = function(jobId) {

    for (var i = 0; i < internals.jobs.length; i++) {
        if (internals.jobs[i].jobId === jobId) {
            return internals.jobs[i].schedule;
        }
    }
    return null;
};

exports.removeSchedule = function(jobId) {
 
    var schedule = internals.getSchedule(jobId);
    console.log('cancelling schedule for jobId: ' + jobId);
    console.log(schedule);
    schedule.cancel();
};
 
exports.addSchedule = function(jobId) {

    console.log('adding schedule job: ' + jobId);
    var scheduleJob = internals.Scheduler.settings.plugins.tacklebox.getJob(jobId);
    console.log('scheduling new job for jobid: ' + jobId);
    var schedule = new Cron.CronJob({
        //cronTime: scheduleJob.schedule.pattern,
        cronTime: "0 * * * * *",
        onTick: function() {
            //console.log('tick');    
            internals.Scheduler.settings.plugins.tacklebox.startRun(jobId);
        },
        start: true
    });
    internals.jobs.push({ jobId: jobId, schedule: schedule });
    //console.log(internals.jobs);
};
