'use strict';

const Handlebars = require('handlebars');

module.exports = function (context) {

    //console.log(context);
    const output = '<a class="btn ' + context.buttonColor + '" href="/view/job/' + context.jobId + '/pr/' + context.number + '/merge">Merge</a>';
    return new Handlebars.SafeString(output);
};
