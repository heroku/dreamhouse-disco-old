
'use strict'

let fmt = require('logfmt')
let path = require('path')
let kue = require('kue')
let moment = require('moment')
let db = require('./models')
let _ = require('lodash')
let request = require('request')
let q = require('./lib/queue')
let config = require('./config')

q.process('track', track)

const validFields = [
  'accountSid',
  'messageSid',
  'smsMessageSid',
  'smsSid',
  'body',
  'from',
  'fromCity',
  'fromCountry',
  'fromState',
  'fromZip',
  'to',
  'toCity',
  'toCountry',
  'toState',
  'toZip',
]

function pauseWorker (ctx) {
  ctx.pause(1000, function (err) {
    fmt.log({
      type: 'warning',
      msg: 'issue occured: worker paused, will resume in 30 seconds'
    })

    setTimeout(function () {
      fmt.log({
        type: 'warning',
        msg: 'worker back on duty'
      })
      ctx.resume();
    }, 30000)
  })
}

// TODO: test this track processor
function track (job, ctx, done) {
  let rawMessage = _.pick(job.data, validFields)

  db.Message.create(rawMessage).then(function(message) {

    fmt.log({
      type: 'info',
      msg: `${message.to}: Worker has job from ${message.fromCity}, requesting ${message.body}`
    })

    let opts = { where: { number: message.get('to') } }

    return db.Account.findOne(opts).then(function(acct) {

      if (!acct) {
        let err = new Error(`No account found, have you auth'd with Spotify?`)
        fmt.log({ type: 'warning', msg: err })
        done(err)
        pauseWorker(ctx)
        return
      }

      let expireAt = moment(acct.get('expires_at'))
      let now = moment()

      if (expireAt.isBefore(now)) {
        let err = new Error(`token expired ${expireAt.fromNow()}`)
        fmt.log({ type: 'warning', msg: err })
        done(err)
        pauseWorker(ctx)
        // TODO: add token refresh logic
        // https://developer.spotify.com/web-api/authorization-guide/#authorization-code-flow
        return
      }

      var opts = {
        auth: { 'bearer': acct.get('access_token') },
        json: true
      }

      const query = message.get('body')
      let spotifySearchUri = `https://api.spotify.com/v1/search?q=${query}&type=track&market=from_token&limit=1`

      request.get(spotifySearchUri, opts, function(err, res, body) {
        // Check for HTTP error
        if (err || res.statusCode ==! 200) {
          fmt.log({
            type: 'error',
            msg: err.message || res.statusCode
          })
          done(err.message || res.statusCode)
          return
        }

        // Check for at least one track returned
        let tracks = body.tracks
        if (!tracks || tracks.total === 0) {
          fmt.log({
            type: 'warning',
            msg: 'Job complete: Spotify search yielded no result',
            messageKey: message.id,
            request: message.body
          })
          done()
          return
        }

        let track = tracks.items[0]

        // Add track to playlist
        const user = acct.get('id')
        let spotifyTrackAddUri = `https://api.spotify.com/v1/users/${user}/playlists/1WCoOeyBzRcWQfcFaJObFZ/tracks?uris=${track.uri}`
        request.post(spotifyTrackAddUri, opts, function(err, res, body) {
          if (err || res.statusCode ==! 200) {
            fmt.log({
              type: 'error',
              msg: err.message || res.statusCode
            })
            done(err.message || res.statusCode)
            return
          }

          fmt.log({
            type: 'info',
            msg: 'Job complete: Track added to the playlist',
            messageKey: message.id,
            trackKey: track.uri
          })

          // Add track id to message record
          message.update({
            trackId: track.uri
          })
          .then(function() {
            done()  // done with job
          })
          .catch(function(err) {
            throw new Error(err)
          })
        })
      })
    }).catch(function(err) {
      throw new Error(err)
    })
  }).catch(function(err) {
    throw new Error(err)
  })
}
