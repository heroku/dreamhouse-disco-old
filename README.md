# Dreamhouse Disco
Hi 🤓
Are you ready to party?

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Dev Setup
1. Create a [Spotify app](https://developer.spotify.com/my-applications/)
1. Copy `.env.sample` to `.env` and fill in the values.  To fill them in you'll need
  1. Postgres database URL
  1. Redis instance URL
  1. And Spotify app client ID and client secret
2. In your Spotify App settings, add the proper redirect URI.  This should be something like http://localhost:5000/api/auth/callback.  The hostname and port might be different for you.
3. You will also need to define a `URL` environment variable in `.env`.  This should point to host and port from which the React app is being served (not the API).  e.g. `URL="http://localhost:5000"`
4. `npm install` to install all the dependencies
5. `patch node_modules/react-scripts/scripts/start.js 0001-Added-proxyPaths-option-to-package.json.patch` to patch one of the dependencies to make local dev easier.

## Running
Run: `heroku local -f Procfile.dev`

That's the easiest way, but you can use whatever you want depending how you're working on it.  There are three processes that comprise the app when running it locally. These are specified in the `Procfile`.  You can run them all easily using [`node-foreman`](https://github.com/strongloop/node-foreman) or [`heroku local`](https://devcenter.heroku.com/articles/heroku-local).  Or you can run them individually in separate terminal windows.

#### Static file server
`npm start`

Serves the React app -- i.e. all the HTML, CSS, and JS (includes auto-rebuild on file change).

#### API
`npm run api`

Handles authentication

#### Track processor
`npm run processTracks`

Looks up track requests with the Spotify API and adds them to the playlist.  Note that tracks to process are added with a `POST` request to the `/api/sms` endpoint.  This is currently built to accept `POST` requests from [Twilio](https://www.twilio.com/).
