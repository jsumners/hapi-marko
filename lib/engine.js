'use strict';

const marko = require('marko');
const Boom = require('boom');
const Hoek = require('hoek');
const Joi = require('Joi');
const path = require('path');

const schema = {};

schema.engine = Joi.object({
  contentType: Joi.string(),
  context: Joi.object(),
  compileMode: Joi.string().valid('sync'),
  defaultExtension: Joi.string(),
  encoding: Joi.string(),
  templatesDir: Joi.string().required()
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
    templatesDir: null
  };
  Hoek.merge(this.options, options);
}

Engine.prototype._resolveTemplate = function _resolveTemplate(tmpl) {
  if (path.isAbsolute(tmpl) && tmpl.endsWith(this.options.defaultExtension)) {
    return tmpl;
  }

  let _t = tmpl;
  if (this.options.templatesDir && tmpl.endsWith(this.options.defaultExtension)) {
    _t = `${this.options.templatesDir}${path.sep}${tmpl}`;
  } else if (this.options.templatesDir) {
    _t = `${this.options.templatesDir}${path.sep}${tmpl}${this.options.defaultExtension}`;
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
  const _options = this.options;
  const source = {
    manager: this,
    template: template,
    context: context,
    options: Hoek.applyToDefaults(_options, options || {})
  };

  if (this.options.context) {
    source.context.$global = this.options.context;
  }

  return request.generateResponse(
    source,
    {
      variety: 'view',
      marshal: marshal
    }
  );
};

module.exports = Engine;