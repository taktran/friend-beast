# Friend beast

A beastly form for the [COSMIC Children of St Mary's Intensive Care hackathon](http://cosmichackathon.challengepost.com/), May 2014.

See: http://friend-beast.herokuapp.com/

## Development

Install pre-requisites

    npm install

For dev server with livereload, js compilation etc:

    grunt

For dev server with api:

    node bin/server.js
    # or, for auto reload
    nodemon bin/server.js

TODO: Consolidate these


## Testing

Uses [karma](http://karma-runner.github.io/) and [jasmine](https://jasmine.github.io/).

Karma is run automatically when `grunt` is called. To run it manually

    karma start config/karma.conf.js

For continuous integration, run

    grunt ci:test

    # Or,

    npm test

## Staging

The staging site is at: http://friend-beast.herokuapp.com/

To set up (only needed once):

    heroku config:add ENV=staging --app friend-beast
    heroku addons:add mongohq --app friend-beast
