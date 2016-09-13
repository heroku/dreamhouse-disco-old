# Dreamhouse Disco
Hi 🤓
Are you ready to party?

## Dev Setup
1. Copy `.env.sample` to `.env` and fill in the values.  To fill them in you'll need
  1. Postgres database URL
  1. Redis instance URL
  1. And [Spotify app](https://developer.spotify.com/my-applications/) client ID and client secret
2. In your Spotify App settings, add the proper redirect URI.  This should be something like http://localhost:5000/api/auth/callback.  The hostname and port might be different for you.

## Running
There are three processes that comprise the app when running it locally. These are specified in the `Procfile`.  You can run them all easily using [`node-foreman`](https://github.com/strongloop/node-foreman) or [`heroku local`](https://devcenter.heroku.com/articles/heroku-local).  Or you can run them individually in separate terminal windows.

#### Static file server
`npm start`

Serves the React app -- i.e. all the HTML, CSS, and JS (includes auto-rebuild on file change).

#### API
`npm run api`

Handles authentication

#### Track processor
`npm run processTracks`

Looks up track requests with the Spotify API and adds them to the playlist.  Note that tracks to process are added with a `POST` request to the `/api/sms` endpoint.  This is currently built to accept `POST` requests from [Twilio](https://www.twilio.com/).
