'use strict';

const Handlebars = require('handlebars');

module.exports = function (context) {

    let output = '';
    const types = ['none', 'email'];
    for (let i = 0; i < types.length; ++i) {
        output += '<div class="btn-group"><span class="input-group-addon"><input type="radio" name="notifyType" value="' + types[i] + '"';
        if (types[i] === context.notifyType ) {
            output += ' checked';
        }
        output += '> </span> <button type="button" class="btn btn-default">' + types[i] + '</button></div>';
    }
    return new Handlebars.SafeString(output);
};
