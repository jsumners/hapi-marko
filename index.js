'use strict';

const fs = require('fs');
const path = require('path');
const Hoek = require('hoek');
const Engine = require('./lib/engine');

function markoHandler(route, options) {
  let _opts = options;

  if (typeof _opts === 'string') {
    _opts = {
      template: _opts
    };
  }

  const settings = {
    template: _opts.template,
    context: _opts.context,
    options: _opts.options
  };

  return function _handler(request, reply) {
    const context = {
      params: request.params,
      payload: request.payload,
      query: request.query,
      pre: request.pre
    };

    if (settings.context) {
      Hoek.merge(context, settings.context);
    }

    reply.marko(_opts.template, context, settings.options);
  };
}

exports.register = function register(server, options, next) {
  server.decorate('server', 'views', function decorator(options) {
    Hoek.assert(options, 'Missing views options');
    const _options = Hoek.clone(options);

    this.realm.plugins.marko = this.realm.plugins.marko || {};
    Hoek.assert(
      !this.realm.plugins.marko.engine,
      'Cannot set views engine more than once'
    );

    this.realm.plugins.marko.engine = new Engine(_options);
  });

  server.decorate(
    'server',
    'render',
    function renderer(tmpl, context, options, callback) {
      const cb = (typeof callback === 'function') ? callback : options;
      const _opts = (options === cb) ? {} : options;

      const marko = (this.realm.plugins.marko || this.root.realm.plugins.marko || {});
      Hoek.assert(marko.engine, 'Missing views engine');

      return marko.engine.render(tmpl, context, _opts, cb);
    }
  );

  server.decorate('reply', 'marko', function marko(template, context, options) {
    const _m = (this.realm.plugins.marko || this.request.server.realm.plugins.marko || {});
    Hoek.assert(_m.engine, 'Cannot render view without a view engine configured');
    return this.response(
      _m.engine._response(template, context, options, this.request)
    );
  });

  server.handler('view', markoHandler);


  return next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};