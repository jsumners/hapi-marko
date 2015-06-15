# Hapi Marko

This module adds support for the [Marko][marko] templating language to
[Hapi][hapi].

<span style="font-size: larger">**Warning:**</span> This module **replaces**
the `reply.view` added by Hapi's native view manager, [Vision][vision]. As a
result, you **should not** use this module if you want to use any view engine
other than Marko. With the way Marko works, i.e. template resolution, this
is a necessary tradeoff.

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
server.register(hapiMarko, function(){});

server.views({
  defaultExtension: '.marko',
  path: __dirname + '/templates'
});

server.route({
  method: 'GET',
  path: '/{param}',
  handler: {
    view: 'index'
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

The following options can be supplied as an options object to `server.views`:

* `compileMode` (string): `'sync'` is the only value currently supported and
  it is the default
* `contentType` (string): the default is `text/html`
* `context` (object): the default global context for all templates. The default
  is `null`
* `defaultExtension` (string): the extension for template files. The default
  is `.marko`
* `encoding` (string): encoding to send to the client. The default is `utf8`
* `path` (string) [required]: the location where template files are stored.
  If `relativeTo` is not supplied, `path` should be an absolute location
  to the directory containing the template files
* `relativeTo` (string): if set, specifies an absolute file path to the
  directory containing template files. When set, all references to `path` will
  be relative to the value of `relativeTo`

Wherever these options are override-able on routes as outlined in the
regular [Hapi][hapi] documentation, so are the options for *hapi-marko*.

## History

+ **0.1.0:**
    + Initial release. Bare bones implementation. Expect problems
    + Synchronous template rendering is the only rendering method supported

# License

[MIT license](http://jsumners.mit-license.org/)

[marko]: https://github.com/raptorjs/marko
[hapi]: http://hapijs.com/
[vision]: https://github.com/hapijs/vision
