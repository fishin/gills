'use strict';

const Handlebars = require('handlebars');

module.exports = function (context) {

    let output = '';
    const types = ['none', 'maxnum', 'maxdays'];
    for (let i = 0; i < types.length; ++i) {
        output += '<div class="btn-group"><span class="input-group-addon"><input type="radio" name="archiveType" value="' + types[i] + '"';
        if (types[i] === context.archiveType ) {
            output += ' checked';
        }
        output += '> </span> <button type="button" class="btn btn-default">' + types[i] + '</button></div>';
    }
    return new Handlebars.SafeString(output);
};
