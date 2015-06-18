# Hapi Marko

This module adds support for the [Marko][marko] templating language to
[Hapi][hapi]. It adds a new method to the reply interface: `reply.marko`. This
method is used to render a Marko template and send the result as the response.

## Install

```bash
$ npm install --production hapi-marko marko
```

**Note:** hapi-marko is written using ES6 features. At this time, no
transpiling to earlier versions is performed. Therefore, you should be running
in an environment that supports ES6.

## Usage

```html
<!-- templates/index.marko -->
<p>${data.params.param}</p>
```

```javascript
// Simple demo
const Hapi = require('hapi');
const hapiMarko = require('hapi-marko');

const server = new Hapi.Server({minimal: true});
server.connection();
server.register(
  {
    register: hapiMarko,
    options: {
      templatesDir: __dirname + '/templates'
    }
  },
  function(){}
);

server.route({
  method: 'GET',
  path: '/{param}',
  handler: function (req, reply) {
    return reply('index', {params: req.params});
  }
});

server.inject(
  {method: 'GET', url: '/foobar'},
  function(response) {
    console.log(response.result); // <p>foobar</p>
  }
);
```

## Options

The following options can be supplied as an options object to the *hapi-mark*
initialization function:

* `compileMode` (string): `'sync'` is the only value currently supported and
  it is the default
* `contentType` (string): the default is `text/html`
* `context` (object): default global context for all templates. The default
  is `null`
* `defaultExtension` (string): the extension for template files. The default
  is `.marko`
* `encoding` (string): encoding to send to the client. The default is `utf8`
* `hotReloading` (object):
    * `enabled` (bool): enables Marko's hot reloading for quickly developing
    templates. This should not be used in production. Default: `false`
    * `delay` (number): how long *hapi-marko*'s file watcher waits when
      hot reloading is enabled before it processes the change. This let's
      editors do their thing before the reload occurs. Default: `2500`
    * `watchFiles` (array): an array of [glob][glob] patterns to match for the
      file watcher. Matched templates will be monitored for changes and reloaded
      accordingingly. This is useful when you use included templates.
      Normally, only the parent template will be monitored. Default: `[]`
* `templatesDir` (string) [required]: the location where template files are
stored. It should be an absolute location to the directory containing the
template files

**Note:** you must supply at least an object with `templatesDir` set.

## History

+ **0.3.1:**
    + Fix incorrect definition of hot reloading maps

+ **0.3.0:**
    + Adjusts `hotReloading` option to an object of other options
    + Adds support for specifying a list of templates to monitor

+ **0.2.0:**
    + Adds hot reloading support for quicker template development

+ **0.1.0:**
    + Initial release. Bare bones implementation. Expect problems
    + Synchronous template rendering is the only rendering method supported

# License

[MIT license](http://jsumners.mit-license.org/)

[marko]: https://github.com/raptorjs/marko
[hapi]: http://hapijs.com/
[vision]: https://github.com/hapijs/vision
