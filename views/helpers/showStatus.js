'use strict';

const Handlebars = require('handlebars');

module.exports = function (context) {

    //console.log(context);
    let output = '';
    if (context === 'succeeded') {
        output = '<span class="glyphicon glyphicon-ok text-success"></span>';
    }
    if (context === 'failed') {
        output = '<span class="glyphicon glyphicon-remove text-danger"></span>';
    }
    return new Handlebars.SafeString(output);
};
