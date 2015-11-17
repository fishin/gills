'use strict';

const Handlebars = require('handlebars');

module.exports = function (context) {

    let output = '';
    const types = ['none', 'cron'];
    for (let i = 0; i < types.length; ++i) {
        output += '<div class="btn-group"><span class="input-group-addon"><input type="radio" name="scheduleType" value="' + types[i] + '"';
        if (types[i] === context.scheduleType ) {
            output += ' checked';
        }
        output += '> </span> <button type="button" class="btn btn-default">' + types[i] + '</button></div>';
    }
    return new Handlebars.SafeString(output);
};
