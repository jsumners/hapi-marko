'use strict';

const marko = require('marko');
const Boom = require('boom');
const Hoek = require('hoek');
const Joi = require('Joi');
const path = require('path');

const schema = {};

schema.defaults = Joi.object({});

schema.viewOverride = schema.defaults.keys({
  contentType: Joi.string(),
  encoding: Joi.string(),
  path: Joi.string(),
  relativeTo: Joi.string()
});

schema.engine = schema.viewOverride.keys({
  compileMode: Joi.string().valid('sync'),
  defaultExtension: Joi.string()
});

function marshal(response, callback) {
  const source = response.source;
  const manager = source.manager;
  manager.render(
    source.template,
    source.context,
    source.options,
    function _cb(err, rendered, config) {
      if (err) {
        return callback(err);
      }

      if (!response.headers['content-type']) {
        response.type(config.contentType);
      }

      response.encoding(config.encoding);

      return callback(null, rendered);
    }
  );
}

function Engine(options) {
  Joi.assert(options, schema.engine);

  this.options = {
    compileMode: 'sync',
    contentType: 'text/html',
    context: null,
    defaultExtension: '.marko',
    encoding: 'utf8',
    path: null,
    relativeTo: null
  };
  Hoek.merge(this.options, options);
}

Engine.prototype._resolveTemplate = function _resolveTemplate(tmpl) {
  if (path.isAbsolute(tmpl) && tmpl.endsWith(this.options.defaultExtension)) {
    return tmpl;
  }

  let _t = tmpl;
  if (this.options.path && this.options.relativeTo) {
    _t = `${this.options.relativeTo}${path.sep}${this.options.path}${path.sep}${tmpl}`;
  } else if (this.options.path && tmpl.endsWith(this.options.defaultExtension)) {
    _t = `${this.options.path}${path.sep}${tmpl}`;
  } else if (this.options.path) {
    _t = `${this.options.path}${path.sep}${tmpl}${this.options.defaultExtension}`;
  }

  return _t;
};

Engine.prototype.render = function render(tmpl, context, options, callback) {
  const _tmpl = this._resolveTemplate(tmpl);

  try {
    const template = marko.load(_tmpl, options);
    const rendered = template.renderSync(context);
    return callback(null, rendered, options);
  } catch (e) {
    return callback(
      Boom.badImplementation(`Could not load template: ${e.message}`)
    );
  }
};

Engine.prototype._response = function _response(template, context, options, request) {
  Joi.assert(options, schema.viewOverride);

  const _options = this.options;
  const source = {
    manager: this,
    template: template,
    context: context,
    options: Hoek.applyToDefaults(_options, options || {})
  };

  return request.generateResponse(
    source,
    {
      variety: 'view',
      marshal: marshal
    }
  );
};

module.exports = Engine;