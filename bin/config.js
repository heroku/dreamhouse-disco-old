
'use strict'

var util = require('./util')
var url = require('url')

var redis = process.env.REDIS_URL && url.parse(process.env.REDIS_URL)
var postgres = process.env.DATABASE_URL && process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
var travoltaUrl = process.env.TRAVOLTA_URL && process.env.TRAVOLTA_URL.replace(/\/$/, '')

module.exports = {
  env: process.env.NODE_ENV || 'development',
  url: process.env.URL || '' ,
  secret: process.env.SESSION_SECRET || 'noSecret',
  verbose: util.bool(process.env.VERBOSE) || false,
  cache: util.bool(process.env.VIEW_CACHE) || true,
  database: process.env.DATABASE_URL || '',
  forceDbRebuild: util.bool(process.env.FORCE_DB_REBUILD) || false,
  travolta: {
    registerUrl: `${travoltaUrl}/disco_registrations` || 'http://travolta-production.herokuapp.com/disco_registrations',
    trackResponseUrl: `${travoltaUrl}/spotify_tracks` || 'http://travolta-production.herokuapp.com/spotify_tracks'
  },
  caseyUrl: process.env.CASEY_URL,
  spotify: {
    clientID: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
    site: 'https://accounts.spotify.com',
    authorizationPath: '/authorize',
    tokenPath: '/api/token',
    playlistName: process.env.PLAYLIST_NAME || 'Dreamhouse Disco, Master'
  },
  redis: {
  	port: redis && redis.port,
  	host: redis && redis.hostname,
  	auth: redis && redis.auth.split(":")[1]
  },
  pg: {
    database: postgres && postgres[5],
    username: postgres && postgres[1],
    password: postgres && postgres[2],
    port: postgres && postgres[4],
    host: postgres && postgres[3]
  },
  server: {
    host: process.env.HOST,
    port: util.int(process.env.PORT || 5000)
  }
}
