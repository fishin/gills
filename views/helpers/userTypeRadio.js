'use strict';

const Handlebars = require('handlebars');

module.exports = function (context) {

    let output = '';
    let types = ['local', 'github'];
    if (context.name === 'admin') {
        types = ['local'];
    }
    for (let i = 0; i < types.length; ++i) {
        output += '<div class="btn-group"><span class="input-group-addon"><input type="radio" name="type" value="' + types[i] + '"';
        if (types[i] === context.type ) {
            output += ' checked';
        }
        output += '> </span> <button type="button" class="btn btn-default">' + types[i] + '</button></div>';
    }
    return new Handlebars.SafeString(output);
};
