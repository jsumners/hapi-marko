'use strict';

const Lab = require('lab');
const Code = require('code');
const Hoek = require('hoek');
const Hapi = require('hapi');
const path = require('path');
const hapiMarko = require('..');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

describe('handler()', function testHandler() {
  it('handles routes to views', function _th(done) {
    const server = new Hapi.Server({minimal: true});
    server.connection();
    server.register(
      {
        register: hapiMarko,
        options: {
          templatesDir: path.resolve(__dirname + '/templates')
        }
      },
      Hoek.ignore
    );

    server.route({
      method: 'GET',
      path: '/{param}',
      handler: function(req, reply) {
        return reply.marko('hello', {params: req.params});
      }
    });
    server.inject(
      {
        method: 'GET',
        url: '/hello'
      },
      function (res) {
        expect(res.result).to.contain('hello');
        done();
      }
    );
  });

  it('blows up with invalid template templatesDir', function _boom(done) {
    const server =  new Hapi.Server({minimal: true});
    server.connection();
    server.register(
      {
        register: hapiMarko,
        options: {
          templatesDir: path.resolve(__dirname + '/nope/templates')
        }
      },
      Hoek.ignore
    );

    server.route({
      method: 'GET',
      path: '/{param}',
      handler: function(req, reply) {
        return reply.marko('hello', {params: req.params});
      }
    });
    server.inject(
      {
        method: 'GET',
        url: '/hello'
      },
      function (res) {
        expect(res.statusCode).to.equal(500);
        done();
      }
    );
  });

  it('handles custom context', function _cc(done) {
    const server = new Hapi.Server({minimal: true});
    server.connection();
    server.register(
      {
        register: hapiMarko,
        options: {
          templatesDir: path.resolve(__dirname + '/templates')
        }
      },
      Hoek.ignore
    );

    server.route({
      method: 'GET',
      path: '/',
      handler: function(req, reply) {
        return reply.marko('valid/test', {message: 'foobar'});
      }
    });

    server.inject('/', function (res) {
      expect(res.result).to.equal('foobar');
      done();
    });
  });

  it('supports a global context', function _gc(done) {
    const server = new Hapi.Server({minimal: true});
    server.connection();
    server.register(
      {
        register: hapiMarko,
        options: {
          context: {foo: 'bar'},
          templatesDir: path.resolve(__dirname + '/templates')
        }
      },
      Hoek.ignore
    );

    server.route({
      method: 'GET',
      path: '/',
      handler: function(req, reply) {
        return reply.marko('global', {message: 'foobar'});
      }
    });

    server.inject('/', function (res) {
      expect(res.result).to.equal('bar');
      done();
    });
  });
});