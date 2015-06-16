'use strict';

const fs = require('fs');
const path = require('path');
const Hoek = require('hoek');
const Engine = require('./lib/engine');

const internals = {};

exports.register = function register(server, options, next) {
  const _opts = (typeof options === 'object') ? options : {};
  internals.engine = new Engine(_opts);

  server.decorate('reply', 'marko', function marko(template, context) {
    const options = {};
    return this.response(
      internals.engine._response(template, context, options, this.request)
    );
  });

  return next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};