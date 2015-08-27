
(function () {

  var hints   = {},
      path    = 'https://gvarsanyi.github.io/uitest/',
      scripts = [path + 'lib/chai.js', path + 'lib/mocha.js',
                 path + 'lib/blanket.js', path + 'lib/jshint.js'];


  function addNode(parent, type, attributes) {
    var key, node;

    attributes = attributes || {};

    node = document.createElement(type.toUpperCase());

    for (key in attributes) {
      node.setAttribute(key, attributes[key]);
    }

    parent.appendChild(node);

    return node;
  }


  function renderHints() {
    var entry, error, errors, i, li, snippet, source, ul,
        wrap = document.getElementById('jshints');

    wrap.innerHTML = '';

    if (Object.keys(hints).length) {
      addNode(wrap, 'h2', {class: 'head'}).innerHTML = 'JSHint';
      for (source in hints) {
        if (hints[source].hints) {
          entry = addNode(wrap, 'h3', {class: 'entry'});
          errors = hints[source].hints.errors || [];
          if (errors && errors.length) {
            entry.innerHTML = '<span class="error">✗ ' + hints[source].url +
                              '</span>';
            ul = addNode(wrap, 'ul');
            for (i = 0; i < errors.length; i += 1) {
              error = errors[i];
              li = addNode(ul, 'li');

              if (error.line > 0) {
                addNode(li, 'span', {class: 'pos'}).innerHTML = 'line ' +
                                                                error.line;
              }

              if (error.reason) {
                addNode(li, 'span', {class: 'reason'}).innerHTML = error.reason;
              }

              if (snippet = error.evidence) {
                if (error.line > 0 && error.character > 0) {
                  snippet = snippet.substr(0, error.character - 1) +
                            '<span class="highlight">' +
                            (snippet[error.character - 1] || '&nbsp;') +
                            '</span>' + snippet.substr(error.character);
                }

                addNode(li, 'pre').innerHTML = snippet;
              }
            }
          } else {
            entry.innerHTML = '<span class="ok">✓</span> ' + hints[source].url;
          }
        }
      }
    }
  }


  function hint(script) {
    var req = new XMLHttpRequest();

    hints[script] = {loading: true};

    req.addEventListener('error', function (event) {
      hints[script].url = event.target.responseURL;
      hints[script].error = true;
      renderHints();
    });

    req.addEventListener('load', function (event) {
      hints[script].url = event.target.responseURL;
      hints[script].loading = false;
      if (event.target.readyState === 4) {
        hints[script].source = event.target.response;
        JSHINT(event.target.response);
        hints[script].hints = JSHINT.data();
      } else {
        hints[script].error = true;
      }
      renderHints();
    });

    req.open('GET', script, true);
    req.send();
  }


  function extendScripts(list, cover) {
    var i, len;

    if (typeof list === 'string') {
      list = [list];
    }

    for (i = 0, len = list.length; i < len; i += 1) {
      hint(list[i]);
      scripts.push(list[i] + (cover ? '#cover' : ''));
    }
  }


  function boot() {
    var lists = JSON.parse(document.getElementById('test-sources').textContent),
        setup = false;

    document.removeEventListener('DOMContentLoaded', arguments.callee, false);

    addNode(document.head, 'link', {rel: 'stylesheet', href: path + 'css/mocha.css'});
    addNode(document.head, 'link', {rel: 'stylesheet', href: path + 'css/custom.css'});
    addNode(document.body, 'div', {id: 'mocha'});
    addNode(document.body, 'div', {id: 'blanket-main'});
    addNode(document.body, 'div', {id: 'jshints'});

    (function loadNextScript() {
      var node, script;
      if (script = scripts.shift()) {
        script = script.split('#');
        node = addNode(document.head, 'script', {src: script[0]});
        node.onload = loadNextScript;
        if (script[1] === 'cover') {
          node.setAttribute('data-cover', 'data-cover');
        }
      } else if (!setup) {
        mocha.setup('bdd');
        chai.should();
        setup = true;

        extendScripts(lists.source, true);
        extendScripts(lists.spec);

        loadNextScript()
      } // else: ready
    })();
  }


  document.addEventListener('DOMContentLoaded', boot, false);

})();
