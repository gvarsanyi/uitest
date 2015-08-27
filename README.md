uitest
======

Create tests for your JavaScript files in the browser.

Uses Mocha TDD + Chai + Should + Blanket (coverage) + JSHINT

# Create our own test page:

    <!DOCTYPE html>
    <html lang='en'>
    <head>
      <meta charset="UTF-8">
      <script src='https://gvarsanyi.github.io/uitest/uitest.js'></script>
      <title>UITest</title>
    </head>
    <body>
      <script id="test-sources" type="application/json">
        {
          "source": ["src/event_emitter.js"],
          "spec": ["spec/event_emitter.spec.js"]
        }
      </script>
    </body>
    </html>


# Profit
